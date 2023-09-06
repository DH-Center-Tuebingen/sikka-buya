import { TreasureItemsImporter } from "../../../frontend/src/models/importer"

describe(`Treasures`, function () {

    describe("Testing Coin Marks", function () {

        this.beforeAll(function () {
            cy.task("MountMinimalDatabase").then(() => {
                cy.fixture("users/admin").then(user => {
                    cy.login(user.email, user.password)
                })
            })

        })

        this.beforeEach(function () {
            cy.restoreLocalStorage()
        })

        it("Item in editor list", function () {
            cy.visit('/editor')
            cy.get(".list-item").contains("Schatzfund")
        })

        //     it("Navigate to List", function () {
        //         cy.visit('/editor')
        //         cy.get(".list-item").contains("Münz- und Beizeichen").click()
        //         cy.location("pathname").should((pathname) => {
        //             expect(pathname).to.eq("/editor/coin_mark")
        //         })
        //         cy.get(".list-item").contains("bāʾ/tāʾ/ṯāʾ")
        //         cy.get(".list-item").contains("drei Punkte (∴)")
        //     })

        //     it("List is showing", function () {
        //         cy.visit('/editor/coin_mark')
        //         cy.get(".list").children().should("have.length", 2)
        //     })

        //     it("List item is visible", function () {
        //         cy.visit('/editor/coin_mark')
        //         cy.get(".list-item").contains("drei Punkte (∴)").should("be.visible")
        //     })

        //     it("Can filter", function () {
        //         cy.visit('/editor/coin_mark')
        //         cy.get("input[type=search]").type("(∴")
        //         cy.get(".list-item").contains("drei Punkte (∴)")
        //         cy.get(".list").children().should("have.length", 1)
        //     })

        //     describe("Create Coin mark", function () {

        //         it("Can reach create page", function () {
        //             cy.visit("/editor/coin_mark")
        //             cy.get("#create-button").click()
        //             cy.location("pathname").should((pathname) => {
        //                 expect(pathname).to.eq("/editor/coin_mark/create")
        //             })
        //             cy.get("#coin-mark-name").should("have.value", "")
        //         })


        //         it("Can cancel create", function () {
        //             cy.visit("/editor/coin_mark/create")
        //             cy.get("#coin-mark-name").type("xxxxx")
        //             cy.get("#cancel-button").click()
        //             cy.location("pathname").should((pathname) => {
        //                 expect(pathname).to.eq("/editor/coin_mark")
        //             })
        //             cy.get(".list-item").contains("drei Punkte (∴)")
        //             cy.get(".list-item").contains("bāʾ/tāʾ/ṯāʾ")
        //             cy.get(".list-item").children().should("have.length", 2)
        //         })

        //         it("Can create new", function () {
        //             cy.visit("/editor/coin_mark/create")
        //             cy.get("#coin-mark-name").type("mīm+dāl")
        //             cy.get("#submit-button").click()
        //             cy.location("pathname").should((pathname) => {
        //                 expect(pathname).to.eq("/editor/coin_mark")
        //             })
        //             cy.get(".list-item").contains("drei Punkte (∴)")
        //             cy.get(".list-item").contains("bāʾ/tāʾ/ṯāʾ")
        //             cy.get(".list-item").contains("mīm+dāl")
        //             cy.get(".list-item").children().should("have.length", 3)
        //         })

        //     })

        //     describe("Edit Coin mark", function () {

        //         it("Access edit page", function () {
        //             cy.visit('/editor/coin_mark')
        //             cy.get(".list-item").contains("mīm+dāl").click()
        //             cy.location("pathname").should((pathname) => {
        //                 expect(pathname).to.eq("/editor/coin_mark/3")
        //             })
        //             cy.get("#coin-mark-name").should("have.value", "mīm+dāl")
        //         })

        //         it("Cannot edit with wrong id", function () {
        //             cy.visit('/editor/coin_mark/8')
        //             cy.get(".information.error").should("not.be.empty")
        //             cy.get("#submit-button").should("have.attr", "disabled")
        //         })


        //         it("Correct id set for update", function () {
        //             cy.visit('/editor/coin_mark/3')
        //             cy.get("#coin-mark-id").should("have.value", 3)
        //         })


        //         it("Can cancel update", function () {
        //             cy.visit('/editor/coin_mark/3')
        //             cy.get("#coin-mark-name").clear().type("xxxxxxxx")
        //             cy.get("#cancel-button").click()
        //             cy.get(".list-item").contains("drei Punkte (∴)")
        //             cy.get(".list-item").contains("bāʾ/tāʾ/ṯāʾ")
        //             cy.get(".list-item").contains("mīm+dāl")
        //             cy.get(".list-item").children().should("have.length", 3)
        //         })

        //         it("Can update", function () {
        //             cy.visit('/editor/coin_mark/3')
        //             cy.get("#coin-mark-name").clear().type("ḫamsa")
        //             cy.get("#submit-button").click()
        //             cy.get(".list-item").contains("drei Punkte (∴)")
        //             cy.get(".list-item").contains("bāʾ/tāʾ/ṯāʾ")
        //             cy.get(".list-item").contains("ḫamsa")
        //             cy.get(".list").children().should("have.length", 3)
        //         })

        //     })


        //     describe("List Order", function () {

        //         it("List is in alphabetical order", function () {
        //             cy.visit("/editor/coin_mark")
        //             cy.get('.list-item .list-item-cell')
        //                 .then($items => {
        //                     const arr = $items.map((_, html) => Cypress.$(html).text()).get()
        //                     return arr
        //                 })
        //                 .should('deep.eq', ["bāʾ/tāʾ/ṯāʾ", "drei Punkte (∴)", "ḫamsa"])
        //         })
        //     })

        //     describe("Delete Coin mark", function () {

        //         it("Delete", function () {
        //             cy.visit("/editor/coin_mark")
        //             cy.triggerDeleteButton(".list-item:nth-child(3) .dynamic-delete-button")
        //             cy.get(".list-item").contains("drei Punkte (∴)")
        //             cy.get(".list-item").contains("bāʾ/tāʾ/ṯāʾ")
        //             cy.get(".list-item").contains("ḫamsa").should("not.exist")

        //         })

        //         it("Still Deleted On Reload", function () {
        //             cy.visit("/editor/coin_mark")
        //             cy.get(".list-item").contains("drei Punkte (∴)")
        //             cy.get(".list-item").contains("bāʾ/tāʾ/ṯāʾ")
        //             cy.get(".list-item").contains("ḫamsa").should("not.exist")
        //         })
        //     })

        // })

    })