

const treasureCommandsFactory = function () {


    Cypress.Commands.add("addTreasureItem", (selector) => {

        cy.get(selector + " .list-add-button-below")
            .click()

        return cy.get(`${selector} .treasure-item-form:last-child`)
    })


    Cypress.Commands.add("setTreasureItemForm", (selector, {
        mintRegion = null,
        mintRegionUncertain = null,
        dynasty = null,
        nominal = null,
        material = null,
        year = null,
        yearUncertain = null,
        fragment = null,
        weight = null,
        coinType = null,
        count = null
    } = {}) => {

        const dataSelectFieldsExcludingType = [
            ["mint-region", mintRegion],
            ["dynasty", dynasty],
            ["nominal", nominal],
            ["material", material],
        ]

        for (let [className, value] of dataSelectFieldsExcludingType) {
            if (value != null && value.type != "") {
                cy.selectFromDataSelect(`${selector} .${className}-data-select`, value.targetText, value.type)
            }else{
                cy.clearDataSelect(`${selector} .${className}-data-select`)
            }
        }

        const inputFields = [
            ["year", year],
            ["year-uncertain", yearUncertain],
            ["mint-region-uncertain", mintRegionUncertain],
            ["weight", weight],
            ["count", count],
        ]

        for (let [className, value] of inputFields) {
            cy.get(`${selector} .${className}-input`).clear()
            if (value != null && value != "") {
                cy.get(`${selector} .${className}-input`).type(value)
            }
        }
            
        if(Cypress.$(`${selector} .fragment-toggle`).hasClass("active") != fragment)
            cy.get(`${selector} .fragment-toggle`).click()

        /**
         * We set the coin type last because it will automatically fill other fields.
         */
        if (coinType != null) {
            cy.selectFromDataSelect(`${selector} .coin-type-data-select`, coinType.targetText, coinType.type)
        }else{
            cy.clearDataSelect(`${selector} .coin-type-data-select`)
        }

    })

    Cypress.Commands.add("checkTreasureItem", (selector, {
        mintRegion = null,
        mintRegionUncertain = null,
        dynasty = null,
        nominal = null,
        material = null,
        year = null,
        yearUncertain = null,
        fragment = null,
        weight = null,
        coinType = null,
        count = null
    } = {}) => {

        const allRequiredArguments = {
            mintRegion,
            mintRegionUncertain,
            dynasty,
            nominal,
            material,
            year,
            yearUncertain,
            fragment,
            weight,
            coinType,
            count
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
            ["dynasty", dynasty],
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
            ["mint-region-uncertain", mintRegionUncertain],
            ["weight", weight],
            ["count", count],
        ]

        for (let [className, value] of inputFields) {
            cy.get(`${selector} .${className}-input`).should("have.have.value", value)
        }

        if (fragment) {
            if (fragment == true)
                cy.get(`${selector} .fragment-toggle`).should("have.class", "active")
            else
                cy.get(`${selector} .fragment-toggle`).should("not.have.class", "active")
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
            cy.setTreasureItemForm(`#treasure-item-list .treasure-item-form:nth-child(${index+1})`, item)
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