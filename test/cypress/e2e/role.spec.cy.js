describe("Testing Role", function () {

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
        cy.get(".list-item").contains("Rolle")
    })

    it("Navigate to List", function () {
        cy.visit('/editor')
        cy.get(".list-item").contains("Rolle").click()
        cy.location("pathname").should((pathname) => {
            expect(pathname).to.eq("/editor/role")
        })
        cy.get(".list-item").contains('heir')
        cy.get(".list-item").contains('cutter')
        cy.get(".list-item").contains('caliph')
    })

    it("Role list is showing", function () {
        cy.visit('/editor/role')
        cy.get(".list").children().should("have.length", 3)
    })

    it("List item is visible", function () {
        cy.visit('/editor/role')
        cy.get(".list-item").contains('heir').should("be.visible")
        cy.get(".list-item").contains('cutter').should("be.visible")
        cy.get(".list-item").contains('caliph').should("be.visible")
    })

    it("Can filter", function () {
        cy.visit('/editor/role')
        cy.get("input[type=search]").type("c")
        cy.get(".list-item").contains('cutter').should("be.visible")
        cy.get(".list-item").contains('caliph').should("be.visible")
        cy.get(".list").children().should("have.length", 2)
    })

    describe("Create Role", function () {

        it("Can reach create page", function () {
            cy.visit("/editor/role")
            cy.get("#create-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/role/create")
            })
            cy.get("#role-name").should("have.value", "")
        })


        it("Can cancel create", function () {
            cy.visit("/editor/role/create")
            cy.get("#role-name").type("xxxxx")
            cy.get("#cancel-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/role")
            })
            cy.get(".list-item").contains('heir')
            cy.get(".list-item").contains('cutter')
            cy.get(".list-item").contains('caliph')
            cy.get(".list-item").children().should("have.length", 3)
        })

        it("Can create new", function () {
            cy.visit("/editor/role/create")
            cy.get("#role-name").type("donator")
            cy.get("#submit-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/role")
            })

            cy.get(".list-item").contains('heir')
            cy.get(".list-item").contains('cutter')
            cy.get(".list-item").contains('caliph')
            cy.get(".list-item").contains('donator')

            cy.get(".list-item").children().should("have.length", 4)
        })

    })

    describe("Edit Role", function () {

        it("Access edit page", function () {
            cy.visit('/editor/role')
            cy.get(".list-item").contains("donator").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/role/6")
            })
            cy.get("#role-name").should("have.value", "donator")
        })

        it("Cannot edit with wrong id", function () {
            cy.visit('/editor/role/8')
            cy.get(".information.error").should("not.be.empty")
            cy.get("#submit-button").should("have.attr", "disabled")
        })


        it("Correct id set for update", function () {
            cy.visit('/editor/role/6')
            cy.get("#role-id").should("have.value", 6)
        })


        it("Can cancel update", function () {
            cy.visit('/editor/role/6')
            cy.get("#role-name").clear().type("xxxxxxxx")
            cy.get("#cancel-button").click()
            cy.get(".list-item").contains('heir')
            cy.get(".list-item").contains('cutter')
            cy.get(".list-item").contains('caliph')
            cy.get(".list-item").contains('donator')
            cy.get(".list-item").children().should("have.length", 4)
        })

        it("Can update", function () {
            cy.visit('/editor/role/6')
            cy.get("#role-name").clear().type("warden")
            cy.get("#submit-button").click()
            cy.get(".list-item").contains('heir')
            cy.get(".list-item").contains('cutter')
            cy.get(".list-item").contains('caliph')
            cy.get(".list-item").contains('warden')
            cy.get(".list-item").children().should("have.length", 4)
        })

    })


    describe("List Order", function () {

        it("List is in alphabetical order", function () {
            cy.visit("/editor/role")
            cy.get('.list-item .list-item-cell')
                .then($items => {
                    const arr = $items.map((_, html) => Cypress.$(html).text()).get()
                    return arr
                })
                .should('deep.eq', ["caliph", "cutter", "heir", "warden"])
        })
    })

    describe("Delete Role", function () {

        it("Delete", function () {
            cy.visit("/editor/role")
            cy.triggerDeleteButton(".list-item:nth-child(4) .dynamic-delete-button")
            cy.get(".list-item").contains('heir')
            cy.get(".list-item").contains('cutter')
            cy.get(".list-item").contains('caliph')
            cy.get(".list-item").children().should("have.length", 3)
        })

        it("Still Deleted On Reload", function () {
            cy.visit("/editor/role")
            cy.get(".list-item").contains('heir')
            cy.get(".list-item").contains('cutter')
            cy.get(".list-item").contains('caliph')
            cy.get(".list-item").children().should("have.length", 3)
        })
    })
})
