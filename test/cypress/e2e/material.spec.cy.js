describe("Testing Materials", function () {

    this.beforeAll(function () {
        cy.task("MountMinimalDatabase")
        cy.fixture("users/admin").then(user => {
            cy.login(user.email, user.password)
        })
    })

    this.beforeEach(function () {
        cy.restoreLocalStorage()
    })

    it("Item in editor list", function () {
        cy.visit('/editor')
        cy.get(".list-item").contains("Material")
    })

    it("Navigate to List", function () {
        cy.visit('/editor')
        cy.get(".list-item").contains("Material").click()
        cy.location("pathname").should((pathname) => {
            expect(pathname).to.eq("/editor/material")
        })
        cy.get(".list-item").contains("Gold")
        cy.get(".list-item").contains("Silber")
    })

    it("Material list is showing", function () {
        cy.visit("/editor/material")
        cy.get(".list").children().should("have.length", 2)
    })

    it("List item is visible", function () {
        cy.visit("/editor/material")
        cy.get(".list-item").contains("Gold")
    })

    it("List item color is shown correctly", function () {
        cy.visit("/editor/material")
        cy.get(".list-item:nth-child(1) .color-indicator").should("have.css", "background-color", "rgb(255, 215, 0)")
    })

    it("Can filter", function () {
        cy.visit("/editor/material")
        cy.get("input[type=search]").type("gol")
        cy.get(".list-item").contains("Gold")
        cy.get(".list").children().should("have.length", 1)
    })

    describe("Create Material", function () {

        it("Can reach create page", function () {
            cy.visit("/editor/material")
            cy.get("#create-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/material/create")
            })
        })

        it("Can cancel create", function () {
            cy.visit("/editor/material/create")
            cy.get("#cancel-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/material")
            })
        })

        it("Can create new material", function () {
            cy.visit("/editor/material/create")
            cy.get("#material-name").type("Bronze")
            cy.get("#submit-button").click()
            cy.get(".list-item").contains("Bronze")
            cy.get(".list-item").contains("Silber")
            cy.get(".list-item").contains("Gold")
            cy.get(".list").children().should("have.length", 3)

        })
    })

    describe("Edit Material", function () {

        it("Can edit", function () {
            cy.visit("/editor/material")
            cy.get(".list-item").contains("Gold").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/material/1")
            })
            cy.get("#material-name").should("have.value", "Gold")
        })

        it("Cannot edit with wrong id", function () {
            cy.visit('/editor/material/42')
            cy.get(".information.error").should("not.be.empty")
            cy.get("#submit-button").should("have.attr", "disabled")
        })

        it("Correct id set for update", function () {
            cy.visit("/editor/material/1")
            cy.get("#material-id").should("have.value", "1")
        })

        it("Can cancel", function () {
            cy.visit("/editor/material/1")
            cy.get("#cancel-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/material")
            })
            cy.get(".list-item").contains("Gold")
            cy.get(".list-item").contains("Silber")
            cy.get(".list-item").contains("Bronze")
            cy.get(".list-item").children().should("have.length", 3)
        })

        it("Can update", function () {
            cy.visit("/editor/material/3")
            cy.get("#material-name").clear().type("Blassgold")
            cy.get("#material-color").clear().type("00ccff")
            cy.get("#submit-button").click()
            cy.get(".list-item").contains("Gold")
            cy.get(".list-item").contains("Silber")
            cy.get(".list-item").contains("Blassgold").parents(".list-item-row").find(".color-indicator").should("have.css", "background-color", "rgb(0, 204, 255)")
            cy.get(".list").children().should("have.length", 3)
        })

    })

    describe("List Order", function () {
        it("List is in alphabetical order", function () {
            cy.visit("/editor/material")
            cy.get('.list-item .list-item-cell')
                .then($items => {
                    const arr = $items.map((_, html) => Cypress.$(html).text()).get()
                    return arr
                })
                .should('deep.eq', ['Blassgold', 'Gold', 'Silber'])
        })
    })


    describe("Delete Material", function () {
        it("Delete", function () {
            cy.visit("/editor/material")
            cy.triggerDeleteButton(".list-item:nth-child(1) .dynamic-delete-button")
            cy.get(".list-item").should("have.length", 2)
            cy.get(".list-item").contains("Gold")
            cy.get(".list-item").contains("Silber")
            cy.get(".list-item").contains("Blassgold").should("not.exist")

        })

        it("Still Deleted On Reload", function () {
            cy.visit("/editor/material")
            cy.get(".list-item").contains("Gold")
            cy.get(".list-item").contains("Silber")
            cy.get(".list-item").contains("Blassgold").should("not.exist")

        })
    })
})