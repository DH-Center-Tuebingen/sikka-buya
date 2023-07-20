const { ALLOWED_STYLES, DB_FIELDS } = require("../../constants/html_formatted_fields")
const { WriteableDatabase, Database, pgp } = require("./database")
const SQLUtils = require("./sql")
const HTMLSanitizer = require("./HTMLSanitizer")
const Overlord = require("../models/overlord")
const Mint = require("../models/mint")
const { camelCaseToSnakeCase } = require("./sql")
const Person = require('../models/person')
const Material = require('../models/material')
const Nominal = require('../models/nominal')
const PageInfo = require('../models/pageinfo')
const graphqlFields = require('graphql-fields')
const { JSDOM } = require("jsdom");
const QueryBuilder = require('./querybuilder')
const Auth = require('../auth')
const { notice, warn } = require('../../scripts/modules/logging')


class Type {

    static async list() {
        return this.getTypes(...arguments)
    }

    static async deleteType(id) {
        if (!id) throw new Error("Id is required.")
        return WriteableDatabase.none(`DELETE FROM type * WHERE id=$[id]`, { id })
    }

    static async updateType(id, data) {
        if (!id) throw new Error("Id is required for update.")
        data.id = id

        return WriteableDatabase.tx(async t => {
            data = await this.preProcessUpsert(data, { transaction: t, skipFetch: true })

            await t.none(`
        UPDATE type 
        SET
            caliph = $[caliph],
            cursive_script = $[cursiveScript],
            donativ = $[donativ],
            exclude_from_map_app=$[excludeFromMapApp],
            exclude_from_type_catalogue=$[excludeFromTypeCatalogue],
            internal_notes = $[internalNotes],
            literature = $[literature],
            material = $[material],
            mint = $[mint],
            mint_as_on_coin = $[mintAsOnCoin],
            mint_uncertain = $[mintUncertain],
            nominal = $[nominal],
            procedure = $[procedure],
            project_id = $[projectId],
            purity = $[purity],
            small=$[small],
            specials=$[specials],
            treadwell_id = $[treadwellId],
            year_of_mint = $[yearOfMint],
            year_uncertain = $[yearUncertain],
            front_side_field_text = $[front_side_field_text],
            front_side_inner_inscript = $[front_side_inner_inscript],
            front_side_intermediate_inscript = $[front_side_intermediate_inscript],
            front_side_outer_inscript = $[front_side_outer_inscript],
            front_side_misc = $[front_side_misc],
            back_side_field_text = $[back_side_field_text],
            back_side_inner_inscript = $[back_side_inner_inscript],
            back_side_intermediate_inscript = $[back_side_intermediate_inscript],
            back_side_outer_inscript = $[back_side_outer_inscript],
            back_side_misc = $[back_side_misc],
            plain_text = $[plainText],
            search_vectors = to_tsvector('german', plain_text)
            WHERE id = $[id] 
        `, data)


            await t.none("DELETE FROM overlord WHERE type=$1", id)
            await t.none("DELETE FROM issuer WHERE type=$1", id)
            await t.none("DELETE FROM other_person WHERE type=$1", id)
            await t.none("DELETE FROM piece WHERE type=$1", id)
            await t.none("DELETE FROM type_coin_marks WHERE type=$1", id)
            await t.none("DELETE FROM type_coin_verse WHERE type=$1", id)


            await this.addOverlords(t, data, id)
            await this.addIssuers(t, data, id)
            await this.addOtherPersons(t, data, id)
            await this.addPieces(t, data, id)
            await this.addCoinMarks(t, data, id)
            await this.addCoinVerses(t, data, id)
            await this.upsertInternalNotesPlainText(t, data, id)

            return id
        })
    }

    static cleanupHTMLFields(type) {
        DB_FIELDS.forEach(field => {
            type[field] = HTMLSanitizer.sanitize(type[field], ...ALLOWED_STYLES)
        })
    }

    static removeEmptyTitlesAndHonorifics(titledPerson) {
        function removeEmpty(el) {
            // This is not ideal, as the id in PSQL could be 0.
            // But only when explicitly defined. Otherwise counting starts at 1.
            // Therefore this should be fine. 
            return el != null && el != 0
        }
        titledPerson.titles = titledPerson.titles.filter(removeEmpty)
        titledPerson.honorifics = titledPerson.honorifics.filter(removeEmpty)
    }

    static wrapCoinSideInformation(source, prefix) {
        const coinSideInformation = {}
        coinSideInformation.fieldText = source[prefix + "field_text"]
        delete source[prefix + "field_text"]
        coinSideInformation.innerInscript = source[prefix + "inner_inscript"]
        delete source[prefix + "inner_inscript"]
        coinSideInformation.intermediateInscript = source[prefix + "intermediate_inscript"]
        delete source[prefix + "intermediate_inscript"]
        coinSideInformation.outerInscript = source[prefix + "outer_inscript"]
        delete source[prefix + "outer_inscript"]
        coinSideInformation.misc = source[prefix + "misc"]
        delete source[prefix + "misc"]

        return coinSideInformation
    }

    static unwrapCoinSideInformation(target, prefix, {
        fieldText,
        innerInscript,
        intermediateInscript,
        outerInscript,
        misc,
    } = {}) {
        let infos = {
            fieldText,
            innerInscript,
            intermediateInscript,
            outerInscript,
            misc
        }

        for (let [key, value] of Object.entries(infos)) {
            key = key.replace(/([A-Z]{1})/g, (match) => {
                return `_${match.toLowerCase()}`
            })
            const fullKey = prefix + key
            target[fullKey] = value
        }

        return target
    }


    static async createPlainTextField(type, { transaction = null, skipFetch = false, context = null }) {
        /**
         * We get the complete type to have all fields available.
         */
        if (!skipFetch)
            type = await this.getFullType(type.id, transaction, context)

        if (!transaction) transaction = Database

        let textProperties = [
            "project_id",
            "treadwell_id",
            "mint_as_on_coin",
            "year_of_mint",
        ]

        textProperties = textProperties.map(attribute => {
            return { key: attribute, text: type[attribute] }
        })

        let namedPropertiesConfig = [
            "material",
            "mint",
            "nominal",
            // Only need a config object if the table name is different than the
            // property name. 
            // { name: "caliph", table: "person" },
        ]

        let nameProperties = []

        for (let property of namedPropertiesConfig) {

            let table, key, text;
            if (typeof property === "string") {
                key = property
                table = property
            } else if (typeof property === "object") {
                key = property.name
                table = property.table
            } else throw new Error(`Mal-configured property in 'createPlainTextField' ${property}`)

            if (type[key]) {
                if (!type[key].name) {
                    text = (await transaction.one(`SELECT name FROM ${table}  WHERE id=$1 LIMIT 1`, type[key])).name
                } else text = type[key].name
            }

            if (!text) warn(`Could not add plain_text property of ${key}!`)

            nameProperties.push({
                key,
                text
            })
        }

        let htmlProperties = [
            "front_side_field_text",
            "front_side_inner_inscript",
            "front_side_intermediate_inscript",
            "front_side_outer_inscript",
            "front_side_misc",
            "back_side_field_text",
            "back_side_inner_inscript",
            "back_side_intermediate_inscript",
            "back_side_outer_inscript",
            "back_side_misc",
            "literature",
            "specials",
        ]


        let errors = {}
        htmlProperties = htmlProperties.map(key => {
            let text = type[key]
            return { key, text }
        })

        let fields = [...textProperties, ...nameProperties, ...htmlProperties].filter(obj => {
            if (!obj || !obj.text || obj.text.trim() === "")
                return false

            try {
                const { document } = (new JSDOM(obj.text)).window;
                if (document.body.textContent.trim() === "") return false
            } catch (e) {
                errors[key] = `Element with ${key} could not be parsed to html: ${e} `
            }

            return true
        })

        fields = fields.map(obj => {
            try {
                const { document } = (new JSDOM(obj.text)).window;
                return document.body.textContent.trim()
            } catch (e) {
                errors[key] = `Element with ${key} could not be parsed to html: ${e} `
            }
            return ""
        })

        let text = fields.filter((text) => (text != null && text != "")).join("\n")
        return { text: type.projectId + "\n" + text, errors }
    }

    static async completeUpsertData(t) {

    }

    static async preProcessUpsert(data, { skipFetch = false, transaction = null, context = null }) {
        /**
        * Thus the avers and reverse data is nested inside a seperate object,
        * inside the GraphQL interface, we need to transform whose properties
        * to the top level, to store them inside the database.
        * 
        * ADDITIONALLY: The 'unwrapCoinSideInformation' takes care of creating
        * empty properties, if the CoinSideInformation is not provided and
        * therefore null.
        */
        this.unwrapCoinSideInformation(data, "front_side_", data.avers)
        this.unwrapCoinSideInformation(data, "back_side_", data.reverse)
        this.cleanupHTMLFields(data)
        data.plainText = (await this.createPlainTextField(data, { skipFetch, transaction, context })).text
        return data
    }

    static async addType(_, args, context, info) {

        return WriteableDatabase.tx(async t => {
            const data = await this.preProcessUpsert(args.data, { skipFetch: true, transaction: t, context })

            const { id: type } = await t.one(`
            INSERT INTO type(
                        project_id,
                        treadwell_id,
                        material,
                        mint,
                        mint_as_on_coin,
                        nominal,
                        year_of_mint,
                        donativ,
                        procedure,
                        caliph,
                        purity,
                        small,
                        front_side_field_text,
                        front_side_inner_inscript,
                        front_side_intermediate_inscript,
                        front_side_outer_inscript,
                        front_side_misc,
                        back_side_field_text,
                        back_side_inner_inscript,
                        back_side_intermediate_inscript,
                        back_side_outer_inscript,
                        back_side_misc,
                        cursive_script,
                        literature,
                        specials,
                        exclude_from_type_catalogue,
                        exclude_from_map_app,
                        internal_notes,
                        mint_uncertain,
                        year_uncertain,
                        plain_text,
                        search_vectors
                    )  VALUES(
                        $[projectId],
                        $[treadwellId],
                        $[material],
                        $[mint],
                        $[mintAsOnCoin],
                        $[nominal],
                        $[yearOfMint],
                        $[donativ],
                        $[procedure],
                        $[caliph],
                        $[purity],
                        $[small],
                        $[front_side_field_text],
                        $[front_side_inner_inscript],
                        $[front_side_intermediate_inscript],
                        $[front_side_outer_inscript],
                        $[front_side_misc],
                        $[back_side_field_text],
                        $[back_side_inner_inscript],
                        $[back_side_intermediate_inscript],
                        $[back_side_outer_inscript],
                        $[back_side_misc],
                        $[cursiveScript],
                        $[literature],
                        $[specials],
                        $[excludeFromTypeCatalogue],
                        $[excludeFromMapApp],
                        $[internalNotes],
                        $[mintUncertain],
                        $[yearUncertain],
                        $[plainText],
                        to_tsvector('german', $[plainText])
                    ) RETURNING id
                        `, data)

            await this.addOverlords(t, data, type)
            await this.addIssuers(t, data, type)
            await this.addOtherPersons(t, data, type)
            await this.addPieces(t, data, type)
            await this.addCoinMarks(t, data, type)
            await this.addCoinVerses(t, data, type)
            await this.upsertInternalNotesPlainText(t, data, type)
            return type
        })
    }

    static async addCoinMarks(t, data, type) {
        data.coinMarks = data.coinMarks.filter(coinMark => coinMark != null)
        for (let coinMark of data.coinMarks.values()) {
            await t.none("INSERT INTO type_coin_marks (coin_mark, type) VALUES ($1,$2)", [coinMark, type])
        }
    }

    static async addCoinVerses(t, data, type) {
        data.coinVerses = data.coinVerses.filter(coinVerse => coinVerse != null)
        for (let coinVerse of data.coinVerses.values()) {
            await t.none("INSERT INTO type_coin_verse (coin_verse, type) VALUES ($1,$2)", [coinVerse, type])
        }
    }

    static async addPieces(t, data, type) {
        for (let piece of data.pieces.values()) {
            await t.none("INSERT INTO piece (piece, type) VALUES ($1,$2)", [piece, type])
        }
    }

    static async addOtherPersons(t, data, type) {
        for (let otherPerson of data.otherPersons.values()) {
            await t.none("INSERT INTO other_person (person, type) VALUES ($1,$2)", [otherPerson, type])
        }
    }

    static async addIssuers(t, data, type) {
        for (let issuer of data.issuers.values()) {
            issuer.type = +type
            this.removeEmptyTitlesAndHonorifics(issuer)
            let { id: issuer_id } = await t.one(pgp.helpers.insert(issuer, ["type", "person"], "issuer") + " RETURNING id")

            for (let title of issuer.titles.values()) {
                await t.none("INSERT INTO issuer_titles(issuer, title) VALUES($1, $2)", [issuer_id, title])
            }

            for (let honorific of issuer.honorifics.values()) {
                await t.none("INSERT INTO issuer_honorifics(issuer, honorific) VALUES($1, $2)", [issuer_id, honorific])
            }
        }
    }

    static async addOverlords(t, data, type) {
        for (let overlord of data.overlords.values()) {
            overlord.type = +type
            overlord.rank = +overlord.rank
            this.removeEmptyTitlesAndHonorifics(overlord)
            let { id: overlord_id } = await t.one(pgp.helpers.insert(overlord, ["rank", "type", "person"], "overlord") + " RETURNING id")
            for (let title of overlord.titles.values()) {
                await t.none("INSERT INTO overlord_titles(overlord_id, title_id) VALUES($1, $2)", [overlord_id, title])
            }
            this.apply
            for (let honorific of overlord.honorifics.values()) {
                await t.none("INSERT INTO overlord_honorifics(overlord_id, honorific_id) VALUES($1, $2)", [overlord_id, honorific])
            }
        }
    }

    static async upsertInternalNotesPlainText(t, data, type) {
        if (data.internalNotes) {
            const internalNotes = data.internalNotes
            let dom = new JSDOM(internalNotes)
            let text = dom.window.document.body.textContent
            if (text !== "") {
                await t.none(`
            INSERT INTO internal_notes_plain_text (type, text) 
            VALUES ($[type], $[text]) 
            ON CONFLICT (type) DO UPDATE 
            SET text=EXCLUDED.text`, { data, type, text })
            }
        }
    }

    static get aliasMap() {
        return {
            "material": "ma",
            "mint": "mi"
        }
    }

    static get targetColumn() {
        return {
            "material": "id",
            "mint": "id"
        }
    }

    static objectToFilters(filterObj) {


        /**
         * TODO // WARNING // ALERT // ERROR: HERE WE HAVE A POTENTIAL DANGER OF SQLINJECTION
         */

        let map = {
            id: "t.id"
        }

        const where = []
        for (let [key, filters] of Object.entries(filterObj)) {
            let db_key = (map[key]) ? map[key] : camelCaseToSnakeCase(key)
            if (
                // Skip if filter is invalid:
                filters == null ||
                filters === "" ||
                // Skip if an empty array is passed:
                (filters.length != null && filters.length === 0)) continue

            if (!Array.isArray(filters)) filters = [filters]

            const ors = []
            filters.forEach((filter) => {

                let tableName = this.aliasMap[db_key] ? this.aliasMap[db_key] : db_key
                if (this.targetColumn[db_key]) {
                    tableName = `${tableName}.${this.targetColumn[db_key]}`
                }
                ors.push(pgp.as.format("$1:value=$2", [tableName, filter]))
            })

            const filter = ors.length === 1 ? ors[0] : `(${ors.join(" OR ")})`
            where.push(filter)
        }
        return where
    }

    static typeQueryProperties({
        filters = {},
        additionalJoin = "",
        additionalRows = [],
        additionalWhere = [],
        context = {},
    } = {}) {
        if (!context) throw new Error("context is required")

        const queryBuilder = new QueryBuilder()
        this.complexFilters(queryBuilder, filters, context)
        const conditions = this.objectToFilters(filters)

        const SELECT = [this.rows, this.getAuthRows(context), ...additionalRows].join(",")
        const JOINS = [this.joins, this.getAuthJoins(context), ...queryBuilder._joins, additionalJoin].join("\n")
        const WHERE = QueryBuilder.buildWhere([...conditions, ...queryBuilder._wheres, ...additionalWhere])
        return { SELECT, JOINS, WHERE }
    }

    static async getTypes(_, { pagination = { count: 50, total: 0, page: 0 }, filters = {}, additionalJoin = "", additionalRows = [], postProcessFields = nullm, transaction = null }, context, info) {

        /**
         * 
         * Better innerjoin for coin_marks:
         * 
         * 
         * 
         *  SELECT * FROM type
            RIGHT JOIN
            (SELECT type_coin_marks.type, array_agg(to_json(coin_marks.*)) FROM type_coin_marks 
            JOIN coin_marks ON coin_marks.id = type_coin_marks.coin_mark
            GROUP BY type_coin_marks.type) AS cm
            ON cm.type = type.id
         */

        if (transaction === null) {
            transaction = Database
        }

        pagination.count = (pagination.count < process.env.MAX_SEARCH) ? pagination.count : process.env.MAX_SEARCH
        const pageInfo = new PageInfo(pagination)

        const { SELECT, JOINS, WHERE } = this.typeQueryProperties({
            filters,
            additionalJoin,
            additionalRows,
            context
        })


        const totalQuery = `
        SELECT count(*)
        FROM type t 
        ${JOINS}
        ${WHERE}
        `

        const total = await transaction.one(totalQuery)
        pageInfo.updateTotal(total.count)

        const query = `
        SELECT 
        ${SELECT}
        FROM type t 
        ${JOINS}
        ${WHERE}
        ORDER BY ${SQLUtils.normalizeString("t.project_id")} ASC
        ${pageInfo.toQuery()}
        
; `

        const result = await transaction.manyOrNone(query)

        if (!postProcessFields) {
            let fields = graphqlFields(info)
            postProcessFields = fields.types
        }

        for (let [idx, type] of result.entries()) {
            result[idx] = await this.postprocessType(transaction, type, postProcessFields, context)
        }

        return { types: result, pageInfo }
    }

    static async yearPlot({ distinct = "id", filters = {}, additionalJoin = "", additionalRows = [], postProcessFields = null } = {}, context) {

        // If we plot the year and we have a filter set as yearOfint
        // it doesn't make sense, therefore we delete it.
        // Also as it is mostly used in conjunction with a displayed year
        // it is more convenient to just keep it in the filter object.
        if (filters.yearOfMint) delete filters.yearOfMint

        const { JOINS, WHERE } = this.typeQueryProperties({
            filters,
            additionalJoin,
            additionalRows,
            additionalWhere: ["t.year_of_mint <> '' AND TRIM(t.year_of_mint) ~ '^[0-9]+$'"],
            context
        })

        const query = `
            SELECT 
                t.year_of_mint,
                COUNT(DISTINCT t.${distinct.replaceAll(/\s+/g, "")}) as count
            FROM type t 
            ${JOINS}
            ${WHERE}
            GROUP BY t.year_of_mint
            ORDER BY TRIM(t.year_of_mint)::numeric ASC`

        return Database.manyOrNone(query)
    }

    static complexFilters(queryBuilder, filter, context) {
        this._processComplexCoinMark(queryBuilder, filter)
        this._processComplexCoinVerse(queryBuilder, filter)
        this._processComplexHonorificsFilter(queryBuilder, filter)
        this._processComplexOtherPersonFilter(queryBuilder, filter)
        this._processComplexTitleFilter(queryBuilder, filter)
        this._processComplexRulerFilter(queryBuilder, filter)
        this._processComplexHeirFilter(queryBuilder, filter)




        if (Object.hasOwnProperty.bind(filter)("completed")) {
            if (filter.completed != null) {
                let completedWhere = (filter.completed) ? "tc.type IS NOT NULL" : "tc.type IS NULL"
                queryBuilder.addWhere(completedWhere)
            }
            delete filter.completed
        }

        if (Object.hasOwnProperty.bind(filter)("reviewed")) {
            if (filter.reviewed != null) {
                let reviewedWhere = (filter.reviewed) ? "tr.type IS NOT NULL" : "tr.type IS NULL"
                queryBuilder.addWhere(reviewedWhere)
            }
            delete filter.reviewed
        }

        ;["projectId", "treadwellId"].forEach(val => {

            const sqlValue = { projectId: "project_id", treadwellId: "treadwell_id" }
            if (Object.hasOwnProperty.bind(filter)(val)) {
                filter[val] = filter[val].trim()
                if (filter[val] != "") {
                    queryBuilder.addWhere(pgp.as.format(`unaccent(t.${sqlValue[val]}) ILIKE unaccent('%$1#%')`, [filter[val]]))
                }
                delete filter[val]
            }
        })
        if (Object.hasOwnProperty.bind(filter)("plain_text")) {
            filter["plain_text"] = filter["plain_text"].trim()
            const searchValues = filter["plain_text"].split(/\s+/g)
            if (searchValues.length > 0) {
                const baseCondition = `unaccent(t.plain_text) ILIKE unaccent($1)`;
                const parameters = `%${searchValues.join("%")}%`


                if (Auth.authContext(context)) {
                    queryBuilder.addWhere(pgp.as.format(`${baseCondition} OR unaccent(inpt.text) ILIKE unaccent($1)`, parameters))
                } else {
                    queryBuilder.addWhere(pgp.as.format(baseCondition, parameters))
                }

            }
            delete filter["plain_text"]
        }



        return queryBuilder
    }

    static async getType(_, { id = null } = {}, context, info) {
        if (!id) throw new Error("Id must be provided!")
        let postProcessFields = graphqlFields(info)
        let response = await this.getTypes(_, { filters: { id }, postProcessFields }, context, info)
        if (!response?.types?.[0]) throw new Error("Requested type does not exist.")
        return response.types[0]
    }


    /**
     * In contrast to getType, does the
     * getFullType not take any query into account.
     * So it can be easily used from utility scripts
     * that just need to get a type.
     * 
     * Therefore the function is also much slower than the getType
     * function an should only be used when not accessed
     * via GraphQL and performance is negligile.
     * 
     * @param {number} id - If of the type you want to access
     */
    static async getFullType(id, transaction = null) {
        if (transaction == null) transaction = Database

        const result = await Database.one(`
            SELECT 
            ${this.rows}
        FROM type t
            ${this.joins}
        WHERE t.id = $1
                `, id).catch((e) => {
            throw new Error("Requested type does not exist: " + e)
        })

        return await this.postprocessType(transaction, result, null, context);
    }

    static get rows() {
        return ` t.*,
                ${Material.query()},
                ${Material.colorQuery()},
                ${Mint.query()}
                ${Nominal.query()}
                province.id AS mint_province_id,
                province.name AS mint_province_name,
                exclude_from_type_catalogue,
                exclude_from_map_app,
                year_uncertain,
                mint_uncertain as guessed_mint,
                p.id AS caliph_id,
                pc.color AS caliph_color,

                CASE WHEN type_completed.type is null
                then False
                else True 
				END as completed,

                CASE WHEN type_reviewed.type is null
                then False
                else True
                END as reviewed
                `
    }

    static get joins() {
        return `
        ${Material.joins()}
        ${Material.colorJoin()}
        LEFT JOIN mint mi 
        ON t.mint = mi.id
        LEFT JOIN province
        ON mi.province = province.id 
        LEFT JOIN nominal n 
        ON t.nominal = n.id
        LEFT JOIN person p
        ON t.caliph = p.id
        LEFT JOIN person_color pc
        ON p.id = pc.person
        LEFT JOIN type_completed ON type_completed.type = t.id
        LEFT JOIN type_reviewed ON type_reviewed.type = t.id

        `
    }

    static getAuthRows(context) {
        let select = ""
        if (Auth.authContext(context)) {
            select = `concat(plain_text,'\\n', inpt.text) AS plain_text, internal_notes`
        } else {
            select = `plain_text`
        }
        return select
    }

    static getAuthJoins(context) {
        let joins = ""
        if (Auth.authContext(context)) {
            joins = `\nLEFT JOIN internal_notes_plain_text inpt ON inpt.type = t.id`
        }
        return joins
    }

    static async postprocessType(transaction, type, fields, context) {
        if (!type) throw new Error(`Type was not provided!`)

        const config = [
            {
                prefix: "material_",
                target: "material",
                keys: ["id", "name", "color"]
            },
            {
                prefix: "mint_",
                target: "mint",
                keys: ["id", "name", "location", "uncertain", "uncertain_area"]
            },
            {
                prefix: "nominal_",
                target: "nominal",
                keys: ["id", "name"]
            },
            {
                prefix: "mint_province_",
                target: "mint.province",
                keys: ["id", "name"]
            },
        ]

        config.forEach(conf => delete type[conf.target])
        SQLUtils.objectifyBulk(type, config)


        if (fields == null)
            fields = [
                "avers",
                "reverse",
                "coinMarks",
                "coinVerse",
                "pieces",
                "caliph",
                "otherPersons",
                "overlords",
                "issuers",
                "plain_text"
            ]

        for (let property of Object.keys(fields)) {
            switch (property) {
                case 'avers':
                    type.avers = this.wrapCoinSideInformation(type, "front_side_")
                    break;
                case "reverse":
                    type.reverse = this.wrapCoinSideInformation(type, "back_side_")
                    break;

                // Arrays
                case "coinMarks":
                    type.coinMarks = await Type.getCoinMarks(transaction, type.id)
                    break
                case "coinVerses":
                    type.coinVerses = await Type.getCoinVerses(transaction, type.id)
                    break
                case "pieces":
                    type.pieces = await Type.getPieces(transaction, type.id)
                    break

                // Persons
                case 'caliph':
                    type.caliph = (type.caliph == null) ? null : await Person.get(transaction, type.caliph)
                    break;
                case 'otherPersons':
                    type.otherPersons = await Type.getOtherPersonsByType(transaction, type.id)
                    break

                // Titled Persons
                case "overlords":
                    type.overlords = await Type.getOverlordsByType(transaction, type.id)
                    break;
                case "issuers":
                    type.issuers = await Type.getIssuerByType(transaction, type.id)
                    break;
            }
        }


        for (let [key, val] of Object.entries(this.databaseToGraphQlMap)) {
            if (type[key] != null) {
                type[val] = type[key]
                delete type[key]
            }
        }

        const isUser = Auth.authContext(context)
        if (!isUser) {
            type.internalNotes = null
        }

        return type

    }

    static get databaseToGraphQlMap() {
        return {
            project_id: "projectId",
            treadwell_id: "treadwellId",
            mint_as_on_coin: "mintAsOnCoin",
            year_of_mint: "yearOfMint",
            cursive_script: "cursiveScript",
            exclude_from_type_catalogue: "excludeFromTypeCatalogue",
            exclude_from_map_app: "excludeFromMapApp",
            internal_notes: "internalNotes",
            guessed_mint: "mintUncertain",
            year_uncertain: "yearUncertain"
        }
    }

    static async getOverlordsByType(transaction, type_id) {

        const response = await transaction.multi(
            `
            SELECT o.id,
            o.rank,
            p.id as person_id,
            p.short_name as person_short_name,
            p.name as person_name,
            p.role as person_role,
            c.color as person_color,
            r.id as person_role_id,
            r.name as person_role_name,
            d.id as person_dynasty_id,
            d.name as person_dynasty_name,
            t.title_names,
            t.title_ids,
            h.honorific_names,
            h.honorific_ids 
            FROM overlord o
            LEFT JOIN(
                SELECT ot.overlord_id AS id, array_agg(t.name) AS title_names, array_agg(t.id) AS title_ids
                 FROM overlord_titles ot
                 JOIN title t ON t.id = ot.title_id
                 GROUP BY ot.overlord_id
            ) t USING(id)
            LEFT JOIN(
                SELECT oh.overlord_id AS id, array_agg(h.name) AS honorific_names, array_agg(h.id) AS honorific_ids
                 FROM overlord_honorifics oh
                 JOIN honorific h ON h.id = oh.honorific_id
                 GROUP BY oh.overlord_id
            ) h USING(id)
            INNER JOIN person p
                ON o.person = p.id
            LEFT JOIN dynasty d ON p.dynasty=d.id
            LEFT JOIN person_role r ON p.role=r.id
            LEFT JOIN person_color c ON c.person = p.id
			WHERE o.type = $1
            ORDER BY o.rank ASC
            `, type_id)

        let result = response[0]
        let overlords = Overlord.extractList(result)
        return overlords
    }

    static async getIssuerByType(transaction, type_id) {
        const response = await transaction.multi(`
        SELECT i.id, i.type,p.id as person_id,
                p.short_name as person_short_name,
                p.name as person_name,
                c.color as person_color,
                r.id as person_role_id,
                r.name as person_role_name,
                d.id as person_dynasty_id,
                d.name as person_dynasty_name,
                t.title_names,
                t.title_ids,
                h.honorific_names,
                h.honorific_ids 
            FROM issuer i
            LEFT JOIN(
                SELECT it.issuer AS id, array_agg(t.name) AS title_names, array_agg(t.id) AS title_ids
                 FROM issuer_titles it
                 JOIN title t ON t.id = it.title
                 GROUP BY it.issuer
            ) t USING(id)
            LEFT JOIN(
                SELECT ih.issuer AS id, array_agg(h.name) AS honorific_names, array_agg(h.id) AS honorific_ids
                 FROM issuer_honorifics ih
                 JOIN honorific h ON h.id = ih.honorific
                 GROUP BY ih.issuer
            ) h USING(id)
            INNER JOIN person p
                ON i.person = p.id
            LEFT JOIN dynasty d ON p.dynasty=d.id
            LEFT JOIN person_role r ON p.role=r.id
            LEFT JOIN person_color c ON c.person = p.id
			WHERE i.type = $1
            `, type_id)

        let result = response[0]
        let issuers = Overlord.extractList(result)
        return issuers
    }

    static async getCoinMarks(transaction, type_id) {
        return await transaction.manyOrNone(`
        SELECT cm.* FROM type_coin_marks tcm
        LEFT JOIN coin_marks cm
            ON tcm.coin_mark = cm.id
			WHERE tcm.type = $1
            `, type_id)
    }

    static async getCoinVerses(transaction, type_id) {
        return await transaction.manyOrNone(`
        SELECT cv.* FROM type_coin_verse tcv
        LEFT JOIN coin_verse cv
            ON tcv.coin_verse = cv.id
			WHERE tcv.type = $1
            `, type_id)
    }

    static async getOtherPersonsByType(transaction, type_id) {
        let result = await transaction.manyOrNone(`
        SELECT 
            p.*,
            d.id as dynasty_id,
            d.name as dynasty_name,
            r.id as role_id,
            r.name as role_name,
            c.color as color
        FROM 
            other_person op 
        LEFT JOIN person p
            ON op.person = p.id
        LEFT JOIN 
            dynasty d ON p.dynasty=d.id
        LEFT JOIN 
            person_role r ON p.role=r.id
        LEFT JOIN
            person_color c ON p.id = c.person
		WHERE 
            op.type = $1
            `, type_id)




        return result.map(person => Person.decomposePersonResult(person))
    }

    static async getPieces(transaction, type_id) {
        let results = await transaction.manyOrNone(`
        SELECT piece.piece FROM piece
			WHERE piece.type = $1
            `, type_id)

        return results.map(res => res.piece)
    }

    /**
     * Limit the filter arguments you can use to a single option.
     * This is good for properties, that you only want to filter once,
     * and if the user requests multiple filters of the same 
     * property, an error is thrown. 
     * 
     * E.g. when using the coin_mark and coin_mark_and filters.
     * 
     * @param {[string]} targetFilters - set of properties that are checkt for concurrency
     * @param {string} name - human readable name of the property to display the error (lower case)
     * @returns name of the active filter element, if no error was thrown
     */
    static _filterGate(filter, targetFilters, name) {
        let activeFilter = null
        targetFilters.forEach(filterName => {
            if (Object.hasOwnProperty.bind(filter)(filterName)) {
                if (activeFilter != null) throw new Error(`Too many ${name} filter. Only use one!`)
                activeFilter = filterName
            }
        })
        return activeFilter
    }

    static _processComplexCoinMark(queryBuilder, filter) {

        let activeCoinMarkFilter = this._filterGate(filter, ["coinMark_and_or", "coinMark", "coinMark_and", "coinMark_or_and"], "coin mark")

        // If a coinmark filter is applied, add the array object to the query:
        if (activeCoinMarkFilter != null) {

            queryBuilder.addJoin(`LEFT JOIN
            (SELECT tcm.type,
                COALESCE(ARRAY_AGG(id) FILTER(
                    WHERE id IS NOT NULL), '{}') as coin_marks
             FROM type_coin_marks tcm
             LEFT JOIN coin_marks cm ON tcm.coin_mark = cm.id
             GROUP BY tcm.type) agg_coin_marks ON agg_coin_marks.type = t.id`)

            queryBuilder.addSelect(`
             COALESCE(agg_coin_marks.titles, '{}') as coin_marks
             `)

            function _nonArrayError() {
                if (!Array.isArray(filter[activeCoinMarkFilter]) && filter[activeCoinMarkFilter].length > 0) {
                    throw new Error("Coin mark needs to be an non-empty array")
                }
            }

            if (activeCoinMarkFilter === "coinMark_and_or") {
                let nonEmptyArrays = filter[activeCoinMarkFilter].filter(el => el.length > 0)
                if (nonEmptyArrays.length > 0) {
                    let clauses = []
                    nonEmptyArrays.forEach(arr => {
                        clauses.push(pgp.as.format(`($[arr]:: int[] <@ agg_coin_marks.coin_marks)`, { arr }))
                    })

                    queryBuilder.addWhere(clauses.join(" OR "))
                }
            }

            if (activeCoinMarkFilter === "coinMark_or_and") {
                let nonEmptyArrays = filter[activeCoinMarkFilter].filter(el => el.length > 0)
                if (nonEmptyArrays.length > 0) {
                    let clauses = []
                    nonEmptyArrays.forEach(arr => {
                        clauses.push(pgp.as.format(`($[arr]:: int[] && agg_coin_marks.coin_marks)`, { arr }))
                    })

                    queryBuilder.addWhere(clauses.join(" AND "))
                }
            }

            if (["coinMark", "coinMark_and"].indexOf(activeCoinMarkFilter) != -1) {
                _nonArrayError()
                if (activeCoinMarkFilter === "coinMark")
                    queryBuilder.addWhere(pgp.as.format(`$[coin_marks]:: int[] && agg_coin_marks.coin_marks`, { coin_marks: filter[activeCoinMarkFilter] }))

                if (activeCoinMarkFilter === "coinMark_and")
                    queryBuilder.addWhere(pgp.as.format(`$[coin_marks]:: int[] <@ agg_coin_marks.coin_marks`, { coin_marks: filter[activeCoinMarkFilter] }))
            }


            delete filter[activeCoinMarkFilter]
        }
    }


    static _processComplexCoinVerse(queryBuilder, filter) {

        let activeCoinVerseFilter = this._filterGate(filter, ["coinVerse_and_or", "coinVerse", "coinVerse_and", "coinVerse_or_and"], "coin verse")

        // If a coinverse filter is applied, add the array object to the query:
        if (activeCoinVerseFilter != null) {

            queryBuilder.addJoin(`LEFT JOIN
            (SELECT tcv.type,
                COALESCE(ARRAY_AGG(id) FILTER(
                    WHERE id IS NOT NULL), '{}') as coin_verse
             FROM type_coin_verse tcv
             LEFT JOIN coin_verse cm ON tcv.coin_verse = cm.id
             GROUP BY tcv.type) agg_coin_verse ON agg_coin_verse.type = t.id`)

            queryBuilder.addSelect(`
             COALESCE(agg_coin_verse.titles, '{}') as coin_verse
             `)

            function _nonArrayError() {
                if (!Array.isArray(filter[activeCoinVerseFilter]) && filter[activeCoinVerseFilter].length > 0) {
                    throw new Error("Coin verse needs to be an non-empty array")
                }
            }

            if (activeCoinVerseFilter === "coinVerse_and_or") {
                let nonEmptyArrays = filter[activeCoinVerseFilter].filter(el => el.length > 0)
                if (nonEmptyArrays.length > 0) {
                    let clauses = []
                    nonEmptyArrays.forEach(arr => {
                        clauses.push(pgp.as.format(`($[arr]:: int[] <@ agg_coin_verse.coin_verse)`, { arr }))
                    })

                    queryBuilder.addWhere(clauses.join(" OR "))
                }
            }

            if (activeCoinVerseFilter === "coinVerse_or_and") {
                let nonEmptyArrays = filter[activeCoinVerseFilter].filter(el => el.length > 0)
                if (nonEmptyArrays.length > 0) {
                    let clauses = []
                    nonEmptyArrays.forEach(arr => {
                        clauses.push(pgp.as.format(`($[arr]:: int[] && agg_coin_verse.coin_verse)`, { arr }))
                    })

                    queryBuilder.addWhere(clauses.join(" AND "))
                }
            }

            if (["coinVerse", "coinVerse_and"].indexOf(activeCoinVerseFilter) != -1) {
                _nonArrayError()
                if (activeCoinVerseFilter === "coinVerse")
                    queryBuilder.addWhere(pgp.as.format(`$[coin_verse]:: int[] && agg_coin_verse.coin_verse`, { coin_verse: filter[activeCoinVerseFilter] }))

                if (activeCoinVerseFilter === "coinVerse_and")
                    queryBuilder.addWhere(pgp.as.format(`$[coin_verse]:: int[] <@ agg_coin_verse.coin_verse`, { coin_verse: filter[activeCoinVerseFilter] }))
            }


            delete filter[activeCoinVerseFilter]
        }
    }

    static _processComplexTitleFilter(queryBuilder, filter) {

        const activeTitleFilter = this._filterGate(filter, ["title", "title_and"], 'title')

        if (Object.hasOwnProperty.bind(filter)(activeTitleFilter)) {
            if (filter?.[activeTitleFilter] && Array.isArray(filter[activeTitleFilter]) && filter[activeTitleFilter].length > 0) {

                queryBuilder.addJoin(pgp.as.format(`LEFT JOIN (WITH RULERS AS
                    (SELECT ID,
                            TYPE,
                            TITLE.TITLE_ID AS TITLE
                        FROM OVERLORD
                        LEFT JOIN OVERLORD_TITLES AS TITLE ON OVERLORD.ID = TITLE.OVERLORD_ID
                        UNION SELECT ID,
                            TYPE,
                            TITLES.TITLE AS TITLE
                        FROM ISSUER
                        LEFT JOIN ISSUER_TITLES AS TITLES ON ISSUER.ID = TITLES.ISSUER),
                    TYPETITLES AS
                    (SELECT TYPE,
                            COALESCE(ARRAY_AGG(TITLE) FILTER(WHERE TITLE IS NOT NULL),'{}') AS TITLES
                        FROM RULERS
                        GROUP BY TYPE)
                SELECT *,
                CASE WHEN TYPETITLES.TITLES ${activeTitleFilter === "title_and" ? '@>' : '&&'} $[titles]::int[] THEN 1 ELSE 0 END AS CONTAINS_TITLES
                FROM TYPETITLES
                ) TITLE_SELECT ON t.id = TITLE_SELECT.type`, { titles: filter[activeTitleFilter] }))

                queryBuilder.addWhere(`TITLE_SELECT.CONTAINS_TITLES = 1`)
            }


            delete filter[activeTitleFilter]
        }
    }

    static _processComplexHonorificsFilter(queryBuilder, filter) {
        const activeFilter = this._filterGate(filter, ["honorific", "honorific_and"], 'honorific')

        if (Object.hasOwnProperty.bind(filter)(activeFilter)) {
            if (filter?.[activeFilter] != null
                && Array.isArray(filter[activeFilter])
                && filter[activeFilter].length > 0) {

                queryBuilder.addJoin(pgp.as.format(`LEFT JOIN (WITH RULERS AS
                    (SELECT ID,
                            TYPE,
                            HONORIFIC.HONORIFIC_ID AS HONORIFIC
                        FROM OVERLORD
                        LEFT JOIN OVERLORD_HONORIFICS AS HONORIFIC ON OVERLORD.ID = HONORIFIC.OVERLORD_ID
                        UNION SELECT ID,
                            TYPE,
                            HONORIFICS.HONORIFIC AS HONORIFIC
                        FROM ISSUER
                        LEFT JOIN ISSUER_HONORIFICS AS HONORIFICS ON ISSUER.ID = HONORIFICS.ISSUER),
                    TYPEHONORIFICS AS
                    (SELECT TYPE,
                            COALESCE(ARRAY_AGG(HONORIFIC) FILTER(WHERE HONORIFIC IS NOT NULL),'{}') AS HONORIFICS
                        FROM RULERS
                        GROUP BY TYPE)
                SELECT *,
                CASE WHEN TYPEHONORIFICS.HONORIFICS ${activeFilter === "honorific_and" ? '@>' : '&&'} $[honorifics]::int[] THEN 1 ELSE 0 END AS CONTAINS_HONORIFICS
                FROM TYPEHONORIFICS
                ) HONORIFIC_SELECT ON t.id = HONORIFIC_SELECT.type`, { honorifics: filter[activeFilter] }))

                queryBuilder.addWhere(`HONORIFIC_SELECT.CONTAINS_HONORIFICS = 1`)
            }

            delete filter[activeFilter]
        }
    }

    static _processComplexOtherPersonFilter(queryBuilder, filter) {

        const activePersonFilter = this._filterGate(filter, ["otherPerson", "otherPerson_and"], 'other person')

        if (Object.hasOwnProperty.bind(filter)(activePersonFilter)) {

            if (!(Array.isArray(filter[activePersonFilter]) && filter[activePersonFilter].length > 0)) {
                throw new Error(`Filter "${activePersonFilter}" needs to be an array with at least 1 element.`)
            }

            queryBuilder.addJoin(`LEFT JOIN(
                            SELECT
                    op.type,
                            COALESCE(array_agg(op.person)) as other_person
                FROM
                    other_person op
                GROUP BY
                    op.type
                        ) other_person_query ON other_person_query.type = t.id`)

            if (activePersonFilter === "otherPerson_and") {
                queryBuilder.addWhere(pgp.as.format(`(other_person @> $[otherPerson]:: int[])`, { otherPerson: filter[activePersonFilter] }))
            } else {
                queryBuilder.addWhere(pgp.as.format(`(other_person && $[otherPerson]:: int[])`, { otherPerson: filter[activePersonFilter] }))
            }
            delete filter[activePersonFilter]
        }
    }

    static _processComplexRulerFilter(queryBuilder, filter) {

        if (Object.hasOwnProperty.bind(filter)("ruler") || Object.hasOwnProperty.bind(filter)("ruler_and")) {
            queryBuilder.addSelect(`(issuers || overlords) as rulers`)
            queryBuilder.addJoin(`LEFT JOIN(
                            SELECT
                        o.type,
                            COALESCE(array_agg(o.person)) as overlords
                    FROM
                        overlord o
                    GROUP BY
                        o.type
                        ) overlord_query ON overlord_query.type = t.id
                LEFT JOIN(
                            SELECT
                        i.type,
                            COALESCE(array_agg(i.person)) as issuers
                    FROM
                        issuer i
                    GROUP BY
                        i.type
                        ) issuer_query ON issuer_query.type = t.id`)


            if (filter["ruler_and"] && filter["ruler"]) {
                queryBuilder.addWhere(pgp.as.format(`((issuers || overlords) @> $[rulerAnd]:: int[] AND (issuers || overlords) && $[rulerOr]:: int[])`, { rulerAnd: filter["ruler_and"], rulerOr: filter["ruler"] }))

            } else if (filter["ruler_and"]) {
                queryBuilder.addWhere(pgp.as.format(`((issuers || overlords) @> $[ruler]:: int[])`, { ruler: filter["ruler_and"] }))

            } else {
                queryBuilder.addWhere(pgp.as.format(`((issuers || overlords) && $[ruler]:: int[])`, { ruler: filter["ruler"] }))
            }


            delete filter["ruler_and"]
            delete filter["ruler"]
        }
    }

    static _processComplexHeirFilter(queryBuilder, filter) {

        if (filter.heir) {
            if (!(Array.isArray(filter.heir) && filter.heir.length > 0)) {
                throw new Error(`Filter "heir" needs to be an array with at least 1 element.`)
            }
            queryBuilder.addJoin(`
        LEFT JOIN(SELECT HEIR_OP.TYPE,
			COALESCE(array_agg(HEIR_OP.PERSON),'{}') AS HEIRS
		FROM OTHER_PERSON HEIR_OP
		LEFT JOIN PERSON ON PERSON.ID = HEIR_OP.PERSON
		LEFT JOIN PERSON_ROLE ON PERSON_ROLE.ID = PERSON.ROLE
		WHERE PERSON_ROLE.NAME = 'heir'
		GROUP BY HEIR_OP.TYPE) heir_op_query ON heir_op_query.type = t.id`)

            queryBuilder.addWhere(pgp.as.format(`(heir_op_query.heirs && $[heir]:: int[])`, filter))

            delete filter.heir
        }
    }
}


module.exports = Type