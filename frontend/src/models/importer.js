import CsvReader from "../utils/CsvReader.js"
import Query from "../database/query.js"
import { TreasureItem } from "./property/treasure.js"
import { snakeCase } from 'lodash'

export class Importer {

    constructor({
        headers = null
    } = {}) {
        this.cache = {}
        this.errorObject = {}
        this.items = []
        this.headers = headers
        this.importing = false
    }

    resetItems() {
        this.items = []
    }

    async execFromFile(file) {
        const reader = new CsvReader(file)
        const { headers, rows } = await reader.read()
        return await this.exec({ headers, rows })
    }

    async exec({ headers, rows }) {
        if (!this.importing) {
            try {
                this.importing = true
                this.resetItems()
                this.validateHeaders(headers)
                this.validateRows(rows)

                if (this.errors.length > 0)
                    return

                let id = 0
                let items = []
                for (let [index, row] of rows.entries()) {
                    const item = await this.format(row, headers, index)
                    item.id = id++
                    items.push(item)
                }
                this.items = items
            } catch (e) {
                this.errorObject.exception = e.message
            } finally {
                this.importing = false
            }
        }
    }

    get errors() {
        const errors = []
        for (let obj of Object.values(this.errorObject)) {

            if (typeof obj === "object") {
                for (let value of Object.values(obj)) {
                    errors.push(value)
                }
            } else {
                errors.push(obj)
            }
        }
        return errors
    }

    format() {
        throw new Error("Not implemented")
    }

    validateHeaders(headers) {
        const requiredHeaders = this.headers
        this.errorObject.headers = []

        if (!headers) {
            throw new Error("No headers passed")
        }
        else if (!requiredHeaders) {
            return true
        } else {
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
            if (missingHeaders.length > 0) {
                const missingHeaderErrors = missingHeaders.map(header => `Header "${header}" is missing.`)
                this.errorObject.headers.push(...missingHeaderErrors)
            }

            return this.errorObject.headers.length === 0
        }
    }

    validateRows(rows) {
        if (!rows || rows.length === 0) {
            this.errorObject.rows = ["No rows found"]
            return false
        } else {
            return true
        }
    }


}


export class TreasureItemsImporter extends Importer {

    constructor() {
        super({
            headers: [
                'Id',
                'Epoche',
                'Prägeort',
                'Prägeort Unsicher',
                'Rekonstruiert',
                'Prägeort wie auf Münze',
                'Prägejahr',
                'Unsicheres Prägejahr',
                'Dinar',
                'Dirham',
                'Fragment',
                'Gewicht',
                'Anzahl'
            ],
        })
    }


    async format(row, headers, index = 0) {

        let item = {}

        let headersMapping = {
            "Id": "coinType",
            "Gewicht": "weight",
            "Prägejahr": "year",
            "Prägeort": "mintRegion",
            "Material": "material",
            "Epoche": "epoch",
            "Fragment": "fragment",
            "Anzahl": "count",
            "Prägeort wie auf Münze": "mintAsOnCoin",
            "Rekonstruiert": "reconstructed",
            "Prägeort Unsicher": "mintRegionUncertain",
            "Unsicheres Prägejahr": "uncertainYear",
        }

        for (const header of this.headers) {
            let key = headersMapping[header] || header
            let value = row[header].trim() || ""

            switch (key.trim()) {
                case "Nr.": continue
                case "coinType":
                    if (value) {
                        if (!this.cache?.coinType?.[value]) {
                            const result = await Query.raw(`{
                                                               coinType (filters: {
                                                                   projectId:  "${value}"
                                                               }, pagination: {
                                                                   count: 1
                                                                   page: 0
                                                               }) {
                                                                   types {
                                                                       id
                                                                       projectId
                                                                       yearOfMint
                                                                       mint {
                                                                           id
                                                                           name
                                                                       }

                                                                       nominal {
                                                                           id
                                                                           name
                                                                       }

                                                                       material {
                                                                           id
                                                                           name
                                                                       }
                                                                   }
                                                               }
                                                           }`)

                            const coin = result.data.data.coinType?.types?.[0]
                            if (coin) {
                                if (!this.cache.coinType)
                                    this.cache.coinType = {}
                                this.cache.coinType[value] = coin
                            } else {
                                if (!this.errorObject.coinType) this.errorObject.coinType = {}
                                this.errorObject.coinType[value] = `CoinType with projectId "${value}" not found`
                            }
                        }

                        if (this.cache?.coinType?.[value]) {
                            const coin = this.cache?.coinType?.[value]
                            item["coinType"] = { projectId: value, id: coin.id }
                            item["material"] = coin.material
                            item["nominal"] = coin.nominal

                            if (coin.yearOfMint) {
                                if (this.isValidInteger(coin.yearOfMint))
                                    item["year"] = coin.yearOfMint
                                else {
                                    item["uncertainYear"] = coin.yearOfMint
                                }
                            }

                            if (coin.mint) {
                                item["mint"] = coin.mint
                            } else if (coin.mintAsOnCoin) {
                                item["mintAsOnCoin"] = coin.mintAsOnCoin
                            }

                        }

                    }
                    break
                case "Dinar": {
                    if (value === "x") {
                        item["material"] = await this.getProperty("material", "Gold")
                        item["nominal"] = await this.getProperty("nominal", "Dinar")
                    }
                    break
                }
                case "Dirham": {
                    if (value === "x") {
                        item["material"] = await this.getProperty("material", "Silber")
                        item["nominal"] = await this.getProperty("nominal", "Dirham")
                    }
                    break
                }
                case "fragment":
                case "mintRegionUncertain":
                case "reconstructed":
                    item[key] = value === "x" ? true : false
                    break
                case "weight": {
                    if (row[header]) {
                        let val = parseFloat(row[header].replace(",", "."))
                        if (!isNaN(val)) {
                            item[key] = val
                        } else {
                            if (!this.errorObject.weight) this.errorObject.weight = {}
                            this.errorObject.weight[index] = `Gewicht "${row[header]}" konnte nicht in eine Zahl umgewandelt`
                        }
                    }
                    break
                }
                case "mintAsOnCoin":
                case "uncertainYear":
                    {
                        item[key] = value || ""
                        break
                    }
                case "count":
                case "year": {
                    if (value !== "") {
                        item[key] = null


                        if (this.isValidInteger(value)) {
                            item[key] = parseInt(value)
                        } else {
                            if (!this.errorObject[key]) this.errorObject[key] = {}
                            this.errorObject.year[index] = `Item (${index}) "${header}"(${value}) ist kein Integer, sofern dies gewollt ist, verschiebe den Wert in die "Unsicheres Prägejahr" Spalte.`
                        }
                    }
                    break;
                }
                case "epoch":
                case "material":
                case "mintRegion": {
                    if (!item[key] && value)
                        try {
                            item[key] = await this.getProperty(key, value)
                        } catch (e) {
                            console.error(e)
                            if (!this.errorObject[key]) this.errorObject[key] = {}
                            this.errorObject[key][index] = `Item (${index}) "${header}"(${value}) konnte nicht gefunden werden.`
                        }
                    break
                }
                default:
                    if (!this.errorObject.missingHeader) this.errorObject.missingHeader = {}
                    this.errorObject.missingHeader[header] = `Unbekannte Spalte: ${header} `


            }


        }


        const treasureItem = new TreasureItem(item)
        return treasureItem.forInput()
    }

    async getProperty(property, name) {
        if (this.cache[property]?.[name]) return this.cache[property][name]

        let value = await this.fetchImportTreasureItem(property, name)
        if (!value) {
            if (!this.errorObject[property])
                this.errorObject[property] = {}

            if (!this.errorObject[property][name])
                this.errorObject[property][name] = `${property} mit Namen "${name}" nicht gefunden.`
        } else {
            if (!this.cache[property]) this.cache[property] = {}
            this.cache[property][name] = value
        }
        return value
    }

    async fetchImportTreasureItem(property, name) {

        if (!name || name.trim() === "")
            return null

        const result = await Query.raw(`{
                                propertyByName(property: "${snakeCase(property)}", name: "${name}") {
                                    id
                                    name
                                }
                            } `)

        const item = result.data?.data?.propertyByName
        return item
    }

    isValidInteger(value) {
        return value !== "" && value % 1 === 0 && !isNaN(value)
    }
}


class Exporter {
    constructor(data) {
        this.data = data
    }

    download(filename, data) {
        const blob = new Blob([data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.setAttribute('hidden', '')
        a.setAttribute('href', url)
        a.setAttribute('download', filename)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        return this
    }

    exec() {
        throw new Error("Not implemented")
    }
}


export class CsvExporter extends Exporter {

    constructor(data, { delimiter = ";", linebreak = "\n" } = {}) {
        super(data)
        this.delimiter = delimiter
        this.linebreak = linebreak
        this.csv = ""
    }

    static use(data) {
        return new CsvExporter(data)
    }

    download(filename) {
        return super.download(filename, this.csv)
    }

    exec() {
        let csv = ""

        const columns = []

        if (this.data.length > 0) {
            for (let key of Object.keys(this.data[0])) {
                columns.push(key)
            }


            for (let row of this.data) {
                for (let column of columns) {
                    const value = row[column]
                    if (value != null) {

                        if (typeof value === "object" && value.id !== undefined) {

                            if (value.name) {
                                csv += `${value.name}`
                            } else if (value.projectId) {
                                csv += `${value.projectId}`
                            } else{
                                csv += " "
                            }
                        }
                        else {
                            csv += `${value}`
                        }
                    }
                    csv += this.delimiter
                }
                csv += this.linebreak
            }
        }

        this.csv = csv
        return this
    }
}