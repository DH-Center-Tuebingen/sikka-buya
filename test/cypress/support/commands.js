// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
import "cypress-localstorage-commands";

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
    cy.request({
        method: "GET",
        url: "http://localhost:4000/graphql",
        body: {
            query: `{login(email: "${email}", password: "${password}"){
                success
                message
                token
                user {
                    id
                    email
                    super
                }
            }}`
        }
    }).then(response => {

        let { user, token } = response?.body?.data?.login

        if (!token) throw new Error("Could not login!")

        cy.setLocalStorage("auth-jwt-token", token)
        cy.setLocalStorage("auth-user", JSON.stringify(user))
        cy.saveLocalStorage()
    })
})

Cypress.Commands.add("typeLines", (selector, lines, clear = true) => {
    if (clear) cy.get(selector).clear()
    cy.get(selector).type(lines.join("{enter}"))
})

Cypress.Commands.add("triggerDeleteButton", (selector) => {
    const deleteButton = cy.get(selector)

    deleteButton.then(el => {
        const rect = el[0].getBoundingClientRect()
        const clickPosition = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        }

        deleteButton
            .trigger("mousedown", { which: 1, eventConstructor: 'MouseEvent' })
            .wait(500)
            .trigger("mousemove", -100, 0, { which: 1, eventConstructor: 'MouseEvent', force: true })
            .wait(200)
            .trigger("mouseup", { force: true })
    })
})


Cypress.Commands.add("clearDataSelect", (selector) => {
    const dataSelect = cy.get(selector)
    dataSelect.find("#clear-btn").click()
})

Cypress.Commands.add("selectFromDataSelect", (selector, targetText, type = "") => {

    cy.clearDataSelect(selector)

    if (type !== "") {
        cy.get(selector + " .name-field").type(type)
    }

    const dataSelect = cy.get(selector)
    dataSelect.click()
    cy.contains(selector + " .search-box li", targetText, { timeout: 2000 }).click()

    /** 
     * The following is more natural for the user and therefore more desirable to test
     * but after updating to Cypress 12 this is not working anymore and the above version 
     * is an easy but not so apprpriate fix.
     */

    // .then((el) => {
    //     const targetRect = el[0].getBoundingClientRect()
    //     const targetPosition = {
    //         x: targetRect.x + targetRect.width / 2,
    //         y: targetRect.y + targetRect.height / 2
    //     }
    //     dataSelect
    //         .trigger("mousemove", { which: 1, pageX: targetPosition.x, pageY: targetPosition.y })
    //         .trigger("click")
    // })
})

Cypress.Commands.add("checkDataSelect", (selector, name = "", id = "", relativeElement = null) => {
    if (relativeElement) {
        cy.wrap(relativeElement).find(`${selector} .name-field`).should("have.value", name)
        cy.wrap(relativeElement).find(`${selector} .data-select-id`).should("have.value", id)

    } else {
        cy.get(selector).find(`.name-field`).should("have.value", name)
        cy.get(selector).find(`.data-select-id`).should("have.value", id)
    }
})

Cypress.Commands.add("checkDataSelectList", (selector, items, relativeElement = null) => {
    function get() {
        if (relativeElement) {
            return cy.wrap(relativeElement).find(selector)
        } else {
            return cy.get(selector)
        }
    }
    const itemSelector = "> .list-container > .list-item"
    get().find(itemSelector).should("have.length", items.length)

    items.forEach((item, index) => {
        get().find(`${itemSelector}:nth-child(${index + 1}) .name-field`).should("have.value", item.name)
        get().find(`${itemSelector}:nth-child(${index + 1}) .data-select-id`).should("have.value", item.id)
    })
})

Cypress.Commands.add("checkEmptyList", (selector) => {
    cy.get(selector).find(".list-item").should("not.exist")
})

Cypress.Commands.add("checkList", (selector, items) => {
    cy.get(`${selector} > .list-container > .list-item`).should("have.length", items.length)


    cy.get(selector).find(".list-item").each(($el, idx) => {
        cy.wrap($el).find("input").should("have.value", items[idx])
    })
})

Cypress.Commands.add("checkPersonList", (selector, items = []) => {
    const selection = cy.get(`${selector} > .list-container > .list-item`)
    selection.should("have.length", items.length)
    selection.each(function (listItem, idx) {

        const { id, name, titles, honorifics } = items[idx]

        cy.checkDataSelect(".titled-person-select > .input-group > .data-select.name", name, id, listItem)

        if (titles != null && titles.length > 0) {
            cy.wrap(listItem).find(".titled-person-title-list .list-item").should("have.length", titles.length).each((titleListItem, idx) => {
                const title = titles[idx]
                cy.checkDataSelect(".data-select.title", title.name, title.id, titleListItem)
            })
        }


        if (honorifics != null && honorifics.length > 0) {
            cy.wrap(listItem).find(".titled-person-honorific-list .list-item").should("have.length", honorifics.length).each((honorificsListItem, idx) => {
                const honorific = honorifics[idx]
                cy.checkDataSelect(".data-select.honorific", honorific.name, honorific.id, honorificsListItem)
            })
        }
    })
})

Cypress.Commands.add("removeNthListItem", (selector, nthChild) => {
    cy.get(selector).find(`> .list-container > .list-item:nth-child(${nthChild}) .remove-button`).dblclick()
})

Cypress.Commands.add("checkFormattedTextArea", (selector, html) => {

    /**
     * The SimpleFormatted Field sets a default value when no value was given.
     * To minimize workload when writing texts, this default will be applied here.
     * 
     * NOTE: Obviously this means, if the default is changed, this will fail and needs to be adjusted accordingly.
     */
    html = (!html) ? "<div style=\"text-align: center;\"><br></div>" : html
    cy.get(`${selector} .formatted-text-area`).should("have.html", html)
})

Cypress.Commands.add("checkCoinSideField", (selector, coinSide) => {
    cy.checkFormattedTextArea(`${selector} .field-text`, coinSide.fieldText)
    cy.checkFormattedTextArea(`${selector} .inner-inscript`, coinSide.innerInscript)
    cy.checkFormattedTextArea(`${selector} .intermediate-inscript`, coinSide.intermediateInscript)
    cy.checkFormattedTextArea(`${selector} .outer-inscript`, coinSide.outerInscript)
    cy.checkFormattedTextArea(`${selector} .misc`, coinSide.misc)
})

Cypress.Commands.add("typeCoinSideField", (selector, coinSideLines) => {
    [
        "fieldText",
        "innerInscript",
        "intermediateInscript",
        "outerInscript",
        "misc",
    ].forEach(property => {
        if (coinSideLines[property]) {
            const propertySelector = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            cy.triggerDeleteButton(`${selector} .${propertySelector} .dynamic-delete-button`)
            cy.typeLines(`${selector} .${propertySelector} .formatted-text-area`, coinSideLines[property])
        }
    })
})

Cypress.Commands.add("clearRemovableInput", (selector) => {
    cy.get(selector + " .remove-button").click()
    cy.get(selector + " input").should("have.value", "")
})


Cypress.Commands.add("inputArrayCloseTo", (selector, target, offset = 0.05) => {
    cy.get(selector).should(($el) => {
        let arr = []
        try {
            arr = JSON.parse($el[0].value)
        } catch (e) { console.log(e) }
        target.forEach((val, idx) => {
            expect(val).to.be.closeTo(arr[idx], offset)
        })
    })
})

Cypress.Commands.add("multiInputArrayCloseTo", (selector, target, offset = 0.05) => {
    cy.get(selector).should(($el) => {

        expect($el).not.to.have.value(undefined)

        let array;
        try {
            array = JSON.parse($el[0].value)
        } catch (e) {
            console.error(e)
        }
        expect(array).to.not.be.undefined
        expect(array).to.have.same.length(target.length)
        target.forEach((arr, pos) => {
            arr.forEach((val, idx) => {
                expect(val).to.be.closeTo(array[pos][idx], offset)
            })
        })
    })
})


//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
