

const treasureCommandsFactory = function () {


    Cypress.Commands.add("addTreasureItem", (selector) => {

        cy.get(selector + " .list-add-button-below")
            .click()

        return cy.get(`${selector} .treasure-item-form:last-child`)
    })


    Cypress.Commands.add("setTreasureItemForm", (selector, {
        mintRegion = null,
        epoch = null,
        nominal = null,
        material = null,
        year = null,
        yearUncertain = null,
        fragment = null,
        weight = null,
        coinType = null,
        count = null,
        mintAsOnCoin = null,
        reconstructed = null,
        mintRegionUncertain = null,
    } = {}) => {

        const dataSelectFieldsExcludingType = [
            ["mint-region", mintRegion],
            ["epoch", epoch],
            ["nominal", nominal],
            ["material", material],
        ]

        for (let [className, value] of dataSelectFieldsExcludingType) {
            if (value != null && value.type != "") {
                cy.selectFromDataSelect(`${selector} .${className}-data-select`, value.targetText, value.type)
            } else {
                cy.clearDataSelect(`${selector} .${className}-data-select`)
            }
        }

        const inputFields = [
            ["year", year],
            ["year-uncertain", yearUncertain],
            ["mint-as-on-coin", mintAsOnCoin],
            ["weight", weight],
            ["count", count],
        ]

        for (let [className, value] of inputFields) {
            cy.get(`${selector} .${className}-input`).clear()
            if (value != null && value != "") {
                cy.get(`${selector} .${className}-input`).type(value)
            }
        }

        const toggles = [
            ["fragment", fragment],
            ["reconstructed", reconstructed],
            ["mint-region-uncertain", mintRegionUncertain],
        ]

        toggles.forEach(([className, value]) => {
            if (value != null) {
                if (Cypress.$(`${selector} .${className}-toggle`).hasClass("active") != value)
                    cy.get(`${selector} .${className}-toggle`).click()
            }
        })

        /**
         * We set the coin type last because it will automatically fill other fields.
         */
        if (coinType != null) {
            cy.selectFromDataSelect(`${selector} .coin-type-data-select`, coinType.targetText, coinType.type)
        } else {
            cy.clearDataSelect(`${selector} .coin-type-data-select`)
        }

    })

    Cypress.Commands.add("checkTreasureItem", (selector, {
        mintRegion = null,
        epoch = null,
        nominal = null,
        material = null,
        year = null,
        yearUncertain = null,
        fragment = null,
        weight = null,
        coinType = null,
        count = null,
        mintAsOnCoin = null,
        reconstructed = null,
        mintRegionUncertain = null,
    } = {}) => {

        const allRequiredArguments = {
            mintRegion,
            mintRegionUncertain,
            epoch,
            nominal,
            material,
            year,
            yearUncertain,
            fragment,
            weight,
            coinType,
            count,
            mintAsOnCoin,
            reconstructed,
            mintRegionUncertain,
        }

        const err = []
        for (let [name, arg] of Object.entries(allRequiredArguments)) {
            if (arg == null) {
                err.push(name)
            }
        }

        if (err.length > 0) {
            throw new Error(`Missing values for: ${err.join(", ")}`)
        }


        const dataSelectFieldsExcludingType = [
            ["coin-type", coinType],
            ["mint-region", mintRegion],
            ["epoch", epoch],
            ["nominal", nominal],
            ["material", material],
        ]

        for (let [className, value] of dataSelectFieldsExcludingType) {
            let { name, id } = value
            if (name == null) name = ""
            if (id == null) id = ""
            cy.checkDataSelect(`${selector} .${className}-data-select`, name, id)
        }

        const inputFields = [
            ["year", year],
            ["year-uncertain", yearUncertain],
            ["weight", weight],
            ["count", count],
            ["mint-as-on-coin", mintAsOnCoin],
        ]

        for (let [className, value] of inputFields) {
            cy.get(`${selector} .${className}-input`).should("have.have.value", value)
        }

        const toggles = [
            ["fragment", fragment],
            ["reconstructed", reconstructed],
            ["mint-region-uncertain", mintRegionUncertain],
        ]

        for (let [className, value] of toggles) {
            if (value == true)
                cy.get(`${selector} .${className}-toggle`).should("have.class", "active")
            else
                cy.get(`${selector} .${className}-toggle`).should("not.have.class", "active")
        }
    })




    Cypress.Commands.add("setTreasureForm", ({
        name = "",
        description = "",
        timespan = ["", ""],
        location = { x: 100, y: 100 },
        radius = null,
        items = []
    } = {
        }) => {

        cy.get("#treasure-name-input").clear().type(name)
        cy.get("#treasure-description-input").clear().type(description)
        cy.get("#treasure-timespan-input input").eq(0).clear().type(timespan[0])
        cy.get("#treasure-timespan-input input").eq(1).clear().type(timespan[1])


        cy.get("input.circle-slider")
            .invoke("val", radius)
            .trigger("input");

        cy.get("#treasure-location-input .leaflet-container").click(location.x, location.y, {
            ctrlKey: true
        })

        for (let [index, item] of items.entries()) {
            if (item.add === true) {
                delete item.add
                cy.addTreasureItem("#treasure-item-list")
            }
            cy.setTreasureItemForm(`#treasure-item-list .treasure-item-form:nth-child(${index + 1})`, item)
        }

    })

    Cypress.Commands.add("checkTreasureForm", ({
        name = "",
        description = "",
        timespan = ["", ""],
        location = null,
        radius = null,
        items = []
    } = {}) => {

        cy.get("#treasure-name-input").should("have.value", name)
        cy.get("#treasure-description-input .formatted-text-area").should("have.html", description)
        cy.get("#treasure-timespan-input input").eq(0).should("have.value", timespan[0])
        cy.get("#treasure-timespan-input input").eq(1).should("have.value", timespan[1])

        cy.inputArrayCloseTo("#treasure-location-input input.location-input-field", location)
        cy.get("#treasure-location-input .circle-slider").should("have.value", radius)


        cy.get("#treasure-item-list .treasure-item-form").should("have.length", items.length)
        for (let [index, item] of items.entries()) {
            cy.checkTreasureItem(`#treasure-item-list .treasure-item-form:nth-child(${index + 1})`, item)
        }
    })

}

export default treasureCommandsFactory