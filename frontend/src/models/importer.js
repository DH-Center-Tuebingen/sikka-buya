import CsvReader from "../utils/CsvReader.js"
import Query from "../database/query.js"
import { TreasureItem } from "./property/treasure.js"

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
                'Dynastie',
                'Prägeort',
                'Unsicherer Prägeort',
                'Prägejahr',
                'Unsicheres Prägejahr',
                'Dinar',
                'Dirham',
                'Fragment',
                'Gewicht',
                'Anzahl'],
        })
    }


    async format(row, headers, index = 0) {

        let item = {}

        let headersMapping = {
            "Id": "coinType",
            "Gewicht": "weight",
            "Prägejahr": "year",
            "Prägeort": "mint",
            "Material": "material",
            "Dynastie": "dynasty",
            "Fragment": "fragment",
            "Anzahl": "count",
            "Unsicherer Prägeort": "uncertainMint",
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

                            console.log("JAHR", coin.yearOfMint)
                            if (coin.yearOfMint) {
                                const year = parseInt(coin.yearOfMint)
                                if (!isNaN(year))
                                    item["year"] = year
                                else {
                                    item["uncertainYear"] = coin.yearOfMint
                                }
                            }

                            if (coin.mint) {
                                item["mint"] = coin.mint
                            } else if (coin.mintAsOnCoin) {
                                item["uncertainMint"] = coin.mintAsOnCoin
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
                case "uncertainMint":
                case "uncertainYear":
                    {
                        item[key] = value || ""
                        break
                    }
                case "count":
                case "year": {
                    if (value !== "") {
                        item[key] = null
                        const year = parseInt(value)
                        if (isNaN(year)) {
                            this.errorObject.year[index] = `Item "${header}"(${index}) ist kein Integer "${item[key]}"`
                        } else {
                            item[key] = value
                        }
                    }
                    break;
                }
                case "material":
                case "mint": {
                    if (!item[key] && value)
                        item[key] = await this.getProperty(key, value)
                    break
                }
                case "dynasty": {
                    if (!item[key] && value)
                        item[key] = await this.getProperty(key, value)
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
                                propertyByName(property: "${property}", name: "${name}") {
                                    id
                                    name
                                }
                            } `)

        const item = result.data?.data?.propertyByName
        return item
    }
}