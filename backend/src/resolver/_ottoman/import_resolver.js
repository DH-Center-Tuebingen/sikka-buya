const NamedModel = require("../../models/named-model");
const MintRegion = require("../../models/mint_region");
const { parse } = require("csv-parse");
const { WriteableDatabase } = require("../../utils/database");
const Treasure = require("../../models/treasure");
const { GeoJSON, GeoJsonPointGeoemtry } = require("../../models/geojson");


async function importDestructor() {
    const tables = ['treasure_item', 'treasure', 'mint_region', 'state', 'nominal', 'material', 'person', 'historical_region', 'issuing_state_region'];
    for (const table of tables) {
        await WriteableDatabase.none(`DELETE FROM ${table}`);
    }
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
        'Hoard/Single finds': 'treasure.singleFind$singlefind',
        'Subclassification of finds': "treasure.subclassification",
        'Type of find uncertain': "treasure.typeOfFindUncertain$boolean",
        // 'Quantity of studied coins (for all findspot)': "", // Calculated
        // 'Date of loss (text)': "",
        'Date of loss from': "treasure.yearOfLoss$range.from",
        'Date of loss from uncertain': "treasure.yearOfLossUncertain$range.from#boolean",
        'Date of loss to': "treasure.yearOfLoss$range.to",
        'Date of loss to uncertain': "treasure.yearOfLossUncertain$range.to#boolean",
        'Circumstances of find': "treasure.description",
        'Collection': "treasure.collection",
        'Publication': "treasure.publication",
        'Issuing state': "item.issuingState@issuing_state",
        'State uncertain': "item.stateUncertain$boolean",
        'Region (cluster of issuing states) (for pie chart)': "item.issuingStateRegion@issuing_state_region",
        'Metal': "item.material@material",
        'Metal uncertain': "item.materialUncertain$boolean",
        'Denomination (precise name)': "item.denominationText",
        'Denomination uncertain': "item.denominationUncertain$boolean",
        'Denomination': "item.nominal@nominal",
        'Type of denomination (for pie chart)': "item.typeOfDenomination",
        'Issuer (only for Ottoman coins)': "item.person@person",
        'Issuer uncertain': "item.personUncertain$boolean",
        // 'Reign period': "",
        // 'Date of minting (text)': "",
        'Date of minting from': "item.yearOfMint$range.from",
        'Date From uncertain': "item.yearOfMintUncertain$range.from#boolean",
        'Date of minting to': "item.yearOfMint$range.to",
        'Date To uncertain': "item.yearOfMintUncertain$range.to#boolean",
        'Mint (only for Ottoman coins)': "item.mintRegion@mint_region",
        'Mint uncertain': "item.mintRegionUncertain$boolean",
        'X coordinate for mint': "item.mintRegion@mint_region:location.x$number",
        'Y coordinate for mint': "item.mintRegion@mint_region:location.y$number",
        'Authenticity of coins': "item.authenticity",
        'Status uncertain': "item.statusUncertain$boolean",
        'Quantity': "item.count$number",
        'Coin type reference (only for Ottoman coins)': "item.coinTypeText",
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

                // For example range attributes we need to cache the values and add it to the same object.
                const rowCache = {}

                const mappingStrategy = columnMapping[csvColumn];
                if (!mappingStrategy) {
                    if (!skippedColumns[csvColumn]) {
                        skippedColumns[csvColumn] = true;
                    }
                } else {

                    const [fieldAndDb, type] = mappingStrategy.split('$');
                    const resolvedType = type ? type.toLowerCase() : 'string';
                    const [field, dbAndProperty] = fieldAndDb.split('@');

                    const [targetName, column] = field.split('.');

                    if (!['treasure', 'item'].includes(targetName)) {
                        console.warn(`Unknown target "${targetName}" for column "${csvColumn}". Skipping.`);
                        continue;
                    }
                    const target = targetName === 'treasure' ? treasure : item;

                    const [db, propertyChain = 'name'] = dbAndProperty ? dbAndProperty.split(':') : [null, null];
                    if (!db) {
                        const resolvedValue = resolveValue(value, resolvedType, target, column);

                        // When we insert a range, we directly add it on the target.
                        if (resolvedValue !== null) {
                            target[column] = resolvedValue;
                        }
                    } else {

                        // Get the property path from the configuration, e.g. "location.x" and split it into parts.
                        const [...propertyParts] = propertyChain.split('.');

                        let resolvedValue = {}
                        if (!resolutionPromises[db]) {
                            resolutionPromises[db] = { db, value: resolvedValue, target, column, type: resolvedType };
                        } else {
                            resolvedValue = resolutionPromises[db].value;
                        }

                        if (propertyParts.length === 0) {
                            throw new Error(`Missing property path for database "${db}" in column mapping.`);
                        }

                        let property = null;
                        if (propertyParts.length > 1) {
                            do {
                                property = propertyParts.shift();
                                if (!resolvedValue[property]) {
                                    resolvedValue[property] = {};
                                }
                                resolvedValue = resolvedValue[property];
                            } while (propertyParts.length > 1);
                        } else {
                            property = propertyParts[0];
                        }

                        resolvedValue[propertyParts[0]] = resolveValue(value, resolvedType, target, column);
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
            treasure.color = '#ff0000';
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
        case 'issuing_state_region':
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
            if (value.location && value.location.x != null && value.location.y != null) {
                value.location = {
                    type: "point",
                    coordinates: [value.location.x, value.location.y]
                }
            }
            return MintRegion.add(value)
        case 'issuing_state':
            // For these we can use the generic NamedModel method.
            const StateModel = new NamedModel('state');
            return StateModel.add(value.name);
        case 'issuing_state_region':
        case 'material':
        case 'nominal':
        case 'person':
        case 'historical_region':

            if (db === 'nominal') {
                console.log("Adding nominal to database:", value)
            }

            // For these we can use the generic NamedModel method.
            const Model = new NamedModel(db);
            return Model.add(value.name);
        default:
            throw new Error(`Unknown database "${db}" when adding to database.`);
    }
}

function resolveBaseValue(value, type) {
    switch (type) {
        case 'number':
            const trimmedValue = value.trim();

            if (trimmedValue === '' || trimmedValue.toLowerCase() === 'unknown' || trimmedValue.toLowerCase() === 'n/a') {
                return null; // Return null for empty strings to represent missing values
            }

            const num = parseFloat(trimmedValue);

            if (isNaN(num)) {
                throw new Error(`Value "${trimmedValue}" is not a valid number.`);
            }

            return isNaN(num) ? 0 : num;
        case 'boolean':
            return Boolean(value.trim());
        case 'singlefind':
            if (value.trim().toLowerCase() === 'single finds') return true;
            if (value.trim().toLowerCase() === 'hoard') return false;
            throw new Error(`Unexpected value "${value}" for singleFind column. Expected "Single finds" or "Hoard".`);
        case 'string':
            return value;
        default:
            throw new Error(`Unknown type "${type}" for value "${value}".`);
    }
}

function resolveValue(value, type, target, column) {

    if (type.startsWith('range.')) {
        const [rangeDef, rangeType = 'number'] = type.split('#')
        const attr = rangeDef.split('.')[1];

        if (!target[column]) {
            target[column] = {};
        }

        target[column][attr] = resolveBaseValue(value, rangeType);
        return null; // The actual value will be set in the target object, so we return null here.
    }

    if (type.startsWith('geometry')) {
        const [geometryDef, geometryType = 'number'] = type.split('#')
        const [attr, subAttr] = geometryDef.split('.');


        if (!target[column]) {
            target[column] = { name: null, location: { x: null, y: null } }; // We set the name here to ensure that the entry is created in the database and we can link it later.
        }

        target[column][attr][subAttr] = resolveBaseValue(value, geometryType);
        return null; // The actual value will be set in the target object, so we return null here.
    }

    return resolveBaseValue(value, type);
}

module.exports = { importResolver, importDestructor };