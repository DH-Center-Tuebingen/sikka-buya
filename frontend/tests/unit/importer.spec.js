

import { TreasureItemsImporter } from "../../src/models/importer"
import chaiap from "chai-as-promised"
import chai from 'chai'
import CsvReader from '../../src/utils/CsvReader'
chai.use(chaiap)
const expect = chai.expect

// Headers: 
// Id; Dynastie; Prägeort; Unsicherer Prägeort; Prägejahr; Unsicheres Prägejahr; Dinar; Dirham; Fragment; Gewicht; Anzahl

describe(`Importer test`, function () {

    it("Empty importer fails", function () {
        const importer = new TreasureItemsImporter();
        expect(importer.exec()).to.be.rejected
    })

    it("Missing header fails with error", async function () {

        const importer = new TreasureItemsImporter();
        const HeaderWithMissingId = `
        Dynastie; Prägeort; Unsicherer Prägeort; Prägejahr; Unsicheres Prägejahr; Dinar; Dirham; Fragment; Gewicht; Anzahl
        `
        const headers = CsvReader.headerFromText(HeaderWithMissingId)

        await importer.exec({ headers, rows: [] })
        await expect(importer.errors).to.deep.equal([
            `Header "Id" is missing.`,
            `No rows found`
        ])
    })

    it(`Importing correct rows without errors`, async function () {
        const HeaderWithMissingId = `
        Id; Dynastie; Prägeort; Unsicherer Prägeort; Prägejahr; Unsicheres Prägejahr; Dinar; Dirham; Fragment; Gewicht; Anzahl
          ; 
        `
        const { headers, rows } = CsvReader.fromText(HeaderWithMissingId)
        const importer = new TreasureItemsImporter();
        await importer.exec({ headers, rows })
        expect(importer.errors).to.have.length(0)
    })

    it(`Importing correct rows produces correct data`, async function () {
        const HeaderWithMissingId = `
        Id; Dynastie; Prägeort; Unsicherer Prägeort; Prägejahr; Unsicheres Prägejahr; Dinar; Dirham; Fragment; Gewicht; Anzahl
        `
        const { headers, rows } = CsvReader.fromText(HeaderWithMissingId)
        const importer = new TreasureItemsImporter();
        await importer.exec({ headers, rows })
        expect(importer.errors).to.have.length(0)
    })


})