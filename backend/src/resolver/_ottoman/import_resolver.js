const NamedModel = require("../../models/named-model");
const MintRegion = require("../../models/mint_region");
const { parse } = require("csv-parse");
const { WriteableDatabase } = require("../../utils/database");
const Treasure = require("../../models/treasure");


async function importDestructor() {
    const tables = ['treasure_item', 'treasure', 'mint_region', 'state', 'nominal', 'material', 'person', 'historical_region'];
    for (const table of tables) {
        await WriteableDatabase.none(`DELETE FROM ${table}`);
    }
    console.log("All relevant tables have been cleared.");
}

async function importResolver(_, { file: fileUpload }) {
    // Resolve the upload promise provided by GraphQL Upload
    const file = await fileUpload.promise;
    const { filename, createReadStream } = file;

    const stream = createReadStream();

    // Configure parser: treat first row as headers -> object columns
    const parser = parse({ columns: true, trim: true, skip_empty_lines: true, bom: true, delimiter: ';' });

    const skippedColumns = {};

    const columnMapping = {
        "Place of finding": 'treasure.name',
        "Historical region of coin loss": 'item.historicalRegion@historical_region',
        'Hoard/Single finds': 'treasure.singleFind$boolean',
        'Subclassification of finds': "treasure.subclassification",
        // 'Type of find uncertain': "",
        // 'Quantity of studied coins (for all findspot)': "", // Calculated
        // 'Date of loss (text)': "",
        // 'Date of loss from': "year_of_loss_from",
        // 'Date of loss from uncertain': "",
        // 'Date of loss to': "year_of_loss_to",
        // 'Date of loss to uncertain': "",
        'Circumstances of find': "treasure.description",
        'Collection': "treasure.collection",
        'Publication': "treasure.publication",
        'Issuing state': "item.issuingState@issuing_state",
        // 'State uncertain': "",
        // 'Region (cluster of issuing states) (for pie chart)': "",
        'Metal': "item.material@material",
        // 'Metal uncertain': "",
        // 'Denomination (precise name)': "",
        // 'Denomination uncertain': "",
        'Denomination (for search)': "item.nominal@nominal",
        // 'Type of denomination (for pie chart)': "",
        'Issuer (only for Ottoman coins)': "item.person@person",
        // 'Issuer uncertain': "",
        // 'Reign period': "",
        // 'Date of minting (text)': "",
        // 'Date of minting from': "year_of_mint_from",
        // 'Date From uncertain': "",
        // 'Date of minting to': "year_of_mint_to",
        // 'Date To uncertain': "",
        'Mint (only for Ottoman coins)': "item.mintRegion@mint_region",
        'Mint uncertain': "item.mintRegionUncertain$boolean",
        // 'X coordinate for mint': "",
        // 'Y coordinate for mint': "",
        'Authenticity of coins': "item.authenticity",
        // 'Status uncertain': "",
        'Quantity': "item.count$number",
        'Coin type reference (only for Ottoman coins)': "",
        // 'Remarks to coin type reference': "",    !!!!
        // 'Remarks': "", // SAME AS CIRCUMSTANCES (?)
        'Display only coins with reliable attribution': "treasure.reliableAttribution$boolean",
        'Display only complete hoard': "treasure.completeHoard$boolean",
        'Display only hoards consisting predominantly (90%+) of Ottoman coins': "treasure.ottomanPredominance$boolean",
        // 'Internal Remarks': "",
        // '№': "",
        // 'Admin. Division': "",
        // 'Date of loss for each coin group from': "",
        // 'Region (cluster of issuing states) (for pie chart) старая версия': "",
    }

    let rowCount = 0;
    try {
        // Pipe the uploaded stream into the CSV parser
        stream.pipe(parser);

        let cachedTreasures = {}

        const databaseCache = {}

        // Use async iteration over parser to process rows as they arrive
        for await (const record of parser) {
            rowCount++;
            const treasure = {};
            const item = {};

            const resolutionPromises = {
                //targetDb: { db: targetDb, value: { ...dbObject }, target, column }
            };

            for (const [csvColumn, value] of Object.entries(record)) {
                if (!value) continue; // Skip empty values

                const mappingStrategy = columnMapping[csvColumn];
                if (!mappingStrategy) {
                    if (!skippedColumns[csvColumn]) {
                        skippedColumns[csvColumn] = true;
                    }
                } else {

                    const [fieldAndDb, type] = mappingStrategy.split('$');
                    const resolvedType = type ? type.toLowerCase() : 'string';

                    console.log(fieldAndDb, resolvedType, type)

                    const [field, dbAndProperty] = fieldAndDb.split('@');
                    const [db, property = 'name'] = dbAndProperty ? dbAndProperty.split(':') : [null, null];

                    const [targetName, column] = field.split('.');
                    if (!['treasure', 'item'].includes(targetName)) {
                        console.warn(`Unknown target "${targetName}" for column "${csvColumn}". Skipping.`);
                        continue;
                    }

                    const target = targetName === 'treasure' ? treasure : item;
                    if (!db) {
                        const resolvedValue = resolveValue(value, resolvedType);
                        if (resolvedType !== 'string') {
                            console.log(`Resolved value for column "${csvColumn}" (${resolvedType}):`, resolvedValue);
                        }
                        target[column] = resolvedValue;
                    } else {
                        const resolvedValue = {}
                        if (!resolutionPromises[db]) {
                            console.log(`Creating resolution promise for database: ${JSON.stringify({ db, value: resolvedValue, target, column, type: resolvedType })}`);
                            resolutionPromises[db] = { db, value: resolvedValue, target, column, type: resolvedType };
                        } else {
                            resolvedValue = resolutionPromises[db].value;
                        }
                        resolvedValue[property] = resolveValue(value, resolvedType);
                    }
                }
            }

            if (!treasure.name) {
                throw new Error(`Missing required treasure name in row ${rowCount}.`);
            }

            // We can create the relative entries only at the end, when we resolved all
            // columns of the sheet and built the complete object.
            await createRelatedDatabaseEntries(resolutionPromises, databaseCache);
            const ensuredTreasure = await ensureTreasure(treasure, cachedTreasures);
            await Treasure.insertItems(WriteableDatabase, ensuredTreasure.id, [item]);
        }

        return { success: true, filename, rows: rowCount, skippedColumns: Object.keys(skippedColumns) };
    } catch (err) {
        console.error('Import failed:', err);
        throw new Error('Import failed: ' + err.message);
    }
}


async function ensureTreasure(treasure, cachedTreasures) {
    let existingTreasure = cachedTreasures[treasure.name]
    if (!existingTreasure) {
        const fetchedTreasure = await Treasure.findByName(treasure.name)
        if (fetchedTreasure) {
            cachedTreasures[treasure.name] = fetchedTreasure
            existingTreasure = fetchedTreasure
        } else {
            treasure.color = '#000000'
            const id = await Treasure.add(treasure);
            treasure.id = id;
            cachedTreasures[treasure.name] = treasure
            existingTreasure = treasure
        }
    }
    return existingTreasure
}

/**
 * Replaces the value of target with the id of the entry. 
 * The entry is created in the respective database if it doesn't exist yet.
 * @param {object} resolutionPromises - obect in the form of { targetDb: { db: targetDb, value: { ...dbObject }, target, column }, ... }
 */
async function createRelatedDatabaseEntries(resolutionPromises, cache = {}) {
    // After we collected all the row data we need to create the base entries first:
    for (const { db, value, type, target, column } of Object.values(resolutionPromises)) {
        if (!value.name) {
            throw new Error(`Missing required name for database "${db}"`);
        }

        // If the value is already cached just return the id.
        let id = cache?.[db]?.[value.name];
        if (!id) {
            // Otherwise we must lookup the value inside the database.
            try {
                let fetchedValue = await getByName(db, value.name);
                if (!fetchedValue) {
                    const addedValue = await addValueToDatabase(db, value);
                    id = addedValue?.id;
                } else {
                    id = fetchedValue.id;

                }
                value.id = id;

                if (!value?.id) {
                    throw new Error(`Failed to fetch or add value "${value.name}" for database "${db}".`);
                }

                if (!cache[db]) cache[db] = {};
                cache[db][value.name] = value.id;
            } catch (err) {
                throw new Error(`Failed to resolve ${db} with value "${value.name}": ${err.message}`);
            }
        }

        if (!id) throw new Error(`Failed to resolve ${db} with value "${value.name}". No ID found or created.`);

        target[column] = id;
    }
}

async function getByName(db, name) {
    switch (db) {
        case 'mint_region':
            return MintRegion.findByName(name)
        case 'issuing_state':
            // For these we can use the generic NamedModel method.
            const StateModel = new NamedModel('state');
            return StateModel.findByName(name);
        case 'material':
        case 'nominal':
        case 'person':
        case 'historical_region':
            // For these we can use the generic NamedModel method.
            const Model = new NamedModel(db);
            return await Model.findByName(name);
        default:
            throw new Error(`Unknown database "${db}" when fetching value by name.`);
    }
}

async function addValueToDatabase(db, value) {
    switch (db) {
        case 'mint_region':
            return MintRegion.add(value)
        case 'issuing_state':
            // For these we can use the generic NamedModel method.
            const StateModel = new NamedModel('state');
            return StateModel.add(value.name);
        case 'material':
        case 'nominal':
        case 'person':
        case 'historical_region':
            // For these we can use the generic NamedModel method.
            const Model = new NamedModel(db);
            return Model.add(value.name);
        default:
            throw new Error(`Unknown database "${db}" when adding to database.`);
    }
}

function resolveValue(value, type) {
    switch (type) {
        case 'number':
            const num = parseInt(value.trim());
            console.error(`Failed to parse number from "${value}". Defaulting to 0.`);
            return isNaN(num) ? 0 : num;
        case 'boolean':
            return Boolean(value.trim());
        case 'string':
            return value;
        default:
            throw new Exception(`Unknown type "${type}" for value "${value}".`);
    }
}

module.exports = { importResolver, importDestructor };