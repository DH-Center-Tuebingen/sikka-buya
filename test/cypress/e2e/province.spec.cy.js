describe("Testing Province", function () {

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
        cy.get(".list-item").contains("Provinz")
    })

    it("Navigate to List", function () {
        cy.visit('/editor')
        cy.get(".list-item").contains("Provinz").click()
        cy.location("pathname").should((pathname) => {
            expect(pathname).to.eq("/editor/province")
        })
        cy.get(".list-item").contains('Fārs')
        cy.get(".list-item").contains('ʿUmān')
        cy.get(".list-item").contains('Ḫūzistān')
    })

    it("Province list is showing", function () {
        cy.visit('/editor/province')
        cy.get(".list").children().should("have.length", 3)
    })

    it("List item is visible", function () {
        cy.visit('/editor/province')
        cy.get(".list-item").contains('ʿUmān').should("be.visible")
    })

    it("Can filter", function () {
        cy.visit('/editor/province')
        cy.get("input[type=search]").type("uma")
        cy.get(".list-item").contains('ʿUmān')
        cy.get(".list").children().should("have.length", 1)
    })

    describe("Create Province", function () {

        it("Can reach create page", function () {
            cy.visit("/editor/province")
            cy.get("#create-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/province/create")
            })
            cy.get("#province-name").should("have.value", "")
        })


        it("Can cancel create", function () {
            cy.visit("/editor/province/create")
            cy.get("#province-name").type("xxxxx")
            cy.get("#cancel-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/province")
            })
            cy.get(".list-item").contains('Fārs')
            cy.get(".list-item").contains('ʿUmān')
            cy.get(".list-item").contains('Ḫūzistān')
            cy.get(".list-item").children().should("have.length", 3)
        })

        it("Can create new province", function () {
            cy.visit("/editor/province/create")
            cy.get("#province-name").type("Kirmān")
            cy.get("#submit-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/province")
            })
            cy.get(".list-item").contains('Fārs')
            cy.get(".list-item").contains('ʿUmān')
            cy.get(".list-item").contains('Ḫūzistān')
            cy.get(".list-item").contains("Kirmān")
            cy.get(".list-item").children().should("have.length", 4)
        })

    })

    describe("Edit Province", function () {

        it("Access edit page", function () {
            cy.visit('/editor/province')
            cy.get(".list-item").contains("Kirmān").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/province/11")
            })

            cy.get("#province-id").should("have.value", "11")
            cy.get("#province-name").should("have.value", "Kirmān")
        })

        it("Cannot edit with wrong id", function () {
            cy.visit('/editor/province/123')
            cy.get(".information.error").should("not.be.empty")
            cy.get("#submit-button").should("have.attr", "disabled")
        })


        it("Correct id set for update", function () {
            cy.visit('/editor/province/11')
            cy.get("#province-id").should("have.value", 11)
        })


        it("Can cancel update", function () {
            cy.visit('/editor/province/11')
            cy.get("#province-name").clear().type("xxxxxxxx")
            cy.get("#cancel-button").click()
            cy.get(".list-item").contains('Fārs')
            cy.get(".list-item").contains('ʿUmān')
            cy.get(".list-item").contains('Ḫūzistān')
            cy.get(".list-item").contains("Kirmān")
            cy.get(".list-item").children().should("have.length", 4)
        })

        it("Can update", function () {
            cy.visit('/editor/province/11')
            cy.get("#province-name").clear().type("ḫamsa")
            cy.get("#submit-button").click()

            cy.get(".list-item").contains('Fārs')
            cy.get(".list-item").contains('ʿUmān')
            cy.get(".list-item").contains('Ḫūzistān')
            cy.get(".list-item").contains("ḫamsa")
            cy.get(".list-item").children().should("have.length", 4)
        })

    })


    describe("List Order", function () {

        it("List is in alphabetical order", function () {
            cy.visit("/editor/province")
            cy.get('.list-item .list-item-cell')
                .then($items => {
                    const arr = $items.map((_, html) => Cypress.$(html).text()).get()
                    return arr
                })
                .should('deep.eq', ['Fārs', "ḫamsa", 'Ḫūzistān', 'ʿUmān'])
        })
    })

    describe("Delete Province", function () {

        it("Delete", function () {
            cy.visit("/editor/province")
            cy.triggerDeleteButton(".list-item:nth-child(2) .dynamic-delete-button")
            cy.get(".list-item").contains('ʿUmān')
            cy.get(".list-item").contains('Fārs')
            cy.get(".list-item").contains("ḫamsa").should("not.exist")

        })

        it("Still Deleted On Reload", function () {
            cy.visit("/editor/province")
            cy.get(".list-item").contains('ʿUmān')
            cy.get(".list-item").contains('Fārs')
            cy.get(".list-item").contains("ḫamsa").should("not.exist")
        })
    })
})
