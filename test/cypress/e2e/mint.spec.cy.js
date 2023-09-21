describe("Testing Mints", function () {

    const coarseness = 0.2

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
        cy.get(".list-item").contains("Prägeort")
    })

    it("Navigate to List", function () {
        cy.visit('/editor')
        cy.get(".list-item").contains("Prägeort").click()
        cy.location("pathname").should((pathname) => {
            expect(pathname).to.eq("/editor/mint")
        })
    })

    it("Prägeort list is showing", function () {
        cy.visit('/editor/mint')
        cy.get(".list").children().should("have.length", 2)
        cy.get(".list-item").contains("Fārs")
        cy.get(".list-item").contains('Šīrāz')
    })

    it("List item is visible", function () {
        cy.visit('/editor/mint')
        cy.get(".list-item").contains("Fārs").should("be.visible")
    })

    it("Can filter", function () {
        cy.visit('/editor/mint')
        cy.get("input[type=search]").type("fa")
        cy.get(".list-item").contains("Fārs")
        cy.get(".list").children().should("have.length", 1)
    })

    describe("Create Prägeort", function () {

        // it("Can reach create page", function () {
        //     cy.visit("/editor/mint")
        //     cy.get("#create-button").click()
        //     cy.location("pathname").should((pathname) => {
        //         expect(pathname).to.eq("/editor/mint/create")
        //     })
        // })

        // it("Create page displayed correctly", function () {
        //     cy.visit("/editor/mint/create")

        //     cy.get("#mint-id").should("have.value", "-1")
        //     cy.get("#mint-name").should("have.value", "")

        //     cy.get("#mint-province .data-select-id").should("have.value", "")
        //     cy.get("#mint-province .name-field").should("have.value", "")

        //     cy.get("#mint-location .location-input-field").should("have.value", "")
        //     cy.get("#mint-location .leaflet-container").should("exist")

        //     cy.get("#mint-notes").should("have.value", "")

        //     cy.get("#mint-location-uncertain input").should("not.have.attr", "checked")
        //     cy.get("#mint-location-uncertain label").click()

        //     cy.get("#mint-uncertain-location-input .leaflet-container").should("exist")

        // })

        it("Can cancel create", function () {
            cy.visit("/editor/mint/create")
            cy.get("#mint-name").type("xxxxx")
            cy.selectFromDataSelect("#mint-province", "Fārs")

            cy.get("#mint-location .leaflet-container").click("center", {
                ctrlKey: true
            })

            cy.inputArrayCloseTo("#mint-location input", [30.03, 50.93], coarseness)
            cy.get("#mint-location-uncertain label").click()
            cy.inputArrayCloseTo("#mint-location input", [30.03, 50.93], coarseness)

            cy.get("#mint-uncertain-location-input .leaflet-container").click(10, 10, {
                ctrlKey: true
            }).click(10, 100, {
                ctrlKey: true
            }).click(100, 100, {
                ctrlKey: true
            }).click(100, 10, {
                ctrlKey: true
            })
            cy.multiInputArrayCloseTo("#mint-uncertain-location-input input.location-input-field", [[38.68, 31.16], [35.52, 31.16], [35.52, 35.11], [38.68, 35.11], [38.68, 31.16]], coarseness)


            cy.get("#mint-notes").type("This will be cancelled soon!")

            cy.get("#cancel-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/mint")
            })

            cy.get(".list-item").contains("Fārs")
            cy.get(".list-item").contains('Šīrāz')
            cy.get(".list-item").children().should("have.length", 2)

        })


        it("Can create new mint", function () {

            cy.visit("/editor/mint/create")
            cy.get("#mint-name").type("Aiḏaǧ")
            cy.selectFromDataSelect("#mint-province", "Ḫūzistān")

            cy.get("#mint-location .leaflet-container").click("center", {
                ctrlKey: true
            })

            cy.inputArrayCloseTo("#mint-location input", [30.03, 50.93], coarseness)

            cy.get("#mint-location-uncertain label").click()
            cy.inputArrayCloseTo("#mint-location input", [30.03, 50.93], coarseness)


            cy.get("#mint-uncertain-location-input .leaflet-container").click(10, 10, {
                ctrlKey: true
            }).click(10, 100, {
                ctrlKey: true
            }).click(100, 100, {
                ctrlKey: true
            }).click(100, 10, {
                ctrlKey: true
            })

            cy.multiInputArrayCloseTo("#mint-uncertain-location-input input.location-input-field", [[38.68, 31.16], [35.52, 31.16], [35.52, 35.11], [38.68, 35.11], [38.68, 31.16]], coarseness)

            cy.get("#mint-notes").type("Newly created mint!")

            cy.get("#submit-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/mint")
            })

            cy.get(".list-item").contains("Fārs")
            cy.get(".list-item").contains('Šīrāz')
            cy.get(".list-item").contains("Aiḏaǧ")
            cy.get(".list-item").children().should("have.length", 3)
        })

        it("Created mint should be correct", function () {
            cy.visit("/editor/mint/3")

            cy.get("#mint-name").should("have.value", "Aiḏaǧ")

            cy.get("#mint-province .name-field").should("have.value", 'Ḫūzistān')
            cy.get("#mint-province .data-select-id").should("have.value", 10)

            cy.get("#mint-location-uncertain input").should("be.checked")

            // On save we add as the last item the first item if first and last differ.
            cy.multiInputArrayCloseTo("#mint-uncertain-location-input input.location-input-field", [[38.68, 31.16], [35.52, 31.16], [35.52, 35.11], [38.68, 35.11], [38.68, 31.16], [38.68, 31.16]], coarseness)

            cy.get("#mint-notes").should("have.value", "Newly created mint!")
        })

    })

    // describe("Edit Prägeort", function () {

    //     this.beforeAll(function () {
    //         cy.task("MountMinimalDatabase")
    //         cy.fixture("users/admin").then(user => {
    //             cy.login(user.email, user.password)
    //         })
    //     })

    //     it("Access edit page", function () {
    //         cy.visit('/editor/mint')
    //         cy.get(".list-item").contains("Fārs").click()
    //         cy.location("pathname").should((pathname) => {
    //             expect(pathname).to.eq("/editor/mint/2")
    //         })
    //     })

    //     it("Cannot edit with wrong id", function () {
    //         cy.visit('/editor/mint/100')
    //         cy.get(".information.error").should("not.be.empty")
    //         cy.get("#submit-button").should("have.attr", "disabled")
    //     })


    //     it("Correct id set for update", function () {
    //         cy.visit('/editor/mint/2')
    //         cy.get("#mint-id").should("have.value", 2)
    //     })


    //     it("Can cancel update", function () {
    //         cy.visit("/editor/mint/2")
    //         cy.get("#mint-name").type("Huzū")
    //         cy.selectFromDataSelect("#mint-province", "Ḫūzistān")

    //         cy.get("#mint-location .leaflet-container").click(100, 100, {
    //             ctrlKey: true
    //         })
    //         cy.inputArrayCloseTo("#mint-location input", [35.52, 35.11], coarseness)


    //         cy.get("#mint-uncertain-location-input .delete-btn").click()
    //         cy.get("#mint-uncertain-location-input .leaflet-container").click(30, 30, {
    //             ctrlKey: true
    //         }).click(100, 50, {
    //             ctrlKey: true
    //         }).click(60, 150, {
    //             ctrlKey: true
    //         })

    //         cy.multiInputArrayCloseTo("#mint-uncertain-location-input input.location-input-field", [[37.99, 32.04], [37.29, 35.11], [33.71, 33.35]], coarseness)

    //         cy.get("#mint-notes").type("Oh we changed the notes completely!")

    //         cy.get("#cancel-button").click()
    //         cy.location("pathname").should((pathname) => {
    //             expect(pathname).to.eq("/editor/mint")
    //         })

    //         cy.get(".list-item").contains("Fārs")
    //         cy.get(".list-item").contains('Šīrāz')
    //         cy.get(".list-item").children().should("have.length", 2)
    //     })

    //     it("Cancelled update still correct", function () {
    //         cy.visit("/editor/mint/2")

    //         cy.get("#mint-name").should("have.value", "Fārs")

    //         cy.get("#mint-province .name-field").should("have.value", 'Fārs')
    //         cy.get("#mint-province .data-select-id").should("have.value", 1)

    //         cy.get("#mint-location-uncertain input").should("be.checked")
    //         // When the last element differs from the first element, we'll add the first element as last. 
    //         // This conforms the GeoJSON specification for polygons.
    //         cy.multiInputArrayCloseTo("#mint-uncertain-location-input input.location-input-field", [[27.17, 53.14], [27.69, 54.45], [27.17, 55.60], [26.76, 55.67], [26.44, 54.87], [26.65, 53.57]], coarseness)

    //         cy.get("#mint-notes").should("have.value", "")
    //     })



    //     it("Can update", function () {
    //         cy.visit("/editor/mint/2")
    //         cy.get("#mint-name").clear().type("Huzū")
    //         cy.selectFromDataSelect("#mint-province", "Ḫūzistān")

    //         cy.get("#mint-location .leaflet-container").click(100, 100, {
    //             ctrlKey: true
    //         })
    //         cy.inputArrayCloseTo("#mint-location input", [35.52, 35.11], coarseness)


    //         cy.get("#mint-uncertain-location-input .delete-btn").click()
    //         cy.get("#mint-uncertain-location-input .leaflet-container").click(30, 30, {
    //             ctrlKey: true
    //         }).click(100, 50, {
    //             ctrlKey: true
    //         }).click(60, 150, {
    //             ctrlKey: true
    //         })

    //         cy.multiInputArrayCloseTo("#mint-uncertain-location-input input.location-input-field", [[37.99, 32.04], [37.29, 35.11], [33.71, 33.35]], coarseness)

    //         cy.get("#mint-notes").clear().type("Oh we changed the notes completely!")

    //         cy.get("#submit-button").click()
    //         cy.location("pathname").should((pathname) => {
    //             expect(pathname).to.eq("/editor/mint")
    //         })

    //         cy.get(".list-item").contains("Huzū")
    //         cy.get(".list-item").contains('Šīrāz')
    //         cy.get(".list-item").children().should("have.length", 2)
    //     })


    //     it("Updated mint should be correct", function () {
    //         cy.visit("/editor/mint/2")

    //         cy.get("#mint-name").should("have.value", "Huzū")

    //         cy.get("#mint-province .name-field").should("have.value", 'Ḫūzistān')
    //         cy.get("#mint-province .data-select-id").should("have.value", 10)

    //         cy.get("#mint-location-uncertain input").should("be.checked")

    //         // When the last element differs from the first element, we'll add the first element as last. 
    //         // This conforms the GeoJSON specification for polygons., [37.99, 32.04]
    //         cy.multiInputArrayCloseTo("#mint-uncertain-location-input input.location-input-field", [[37.99, 32.04], [37.29, 35.11], [33.71, 33.35], [37.99, 32.04]], coarseness)

    //         cy.get("#mint-notes").should("have.value", "Oh we changed the notes completely!")

    //     })

    // })


    // describe("List Order", function () {

    //     this.beforeAll(function () {
    //         cy.task("MountMinimalDatabaseWithCreatedMint")
    //         cy.fixture("users/admin").then(user => {
    //             cy.login(user.email, user.password)
    //         })
    //     })

    //     it("List is in alphabetical order", function () {
    //         cy.visit("/editor/mint")
    //         cy.get('.list-item .list-item-cell')
    //             .then($items => {
    //                 const arr = $items.map((_, html) => Cypress.$(html).text()).get()
    //                 return arr
    //             })
    //             .should('deep.eq', ["Aiḏaǧ", 'Fārs', 'Šīrāz'])
    //     })
    // })

    // describe("Delete Prägeort", function () {
    //     this.beforeAll(function () {
    //         cy.task("MountMinimalDatabaseWithCreatedMint")
    //         cy.fixture("users/admin").then(user => {
    //             cy.login(user.email, user.password)
    //         })
    //     })


    //     it("Elements are correct in list", function () {
    //         cy.visit("/editor/mint")

    //         cy.get(".list-item").contains("Aiḏaǧ")
    //         cy.get(".list-item").contains('Šīrāz')
    //         cy.get(".list-item").contains("Fārs")
    //     })

    //     it("Delete", function () {
    //         cy.visit("/editor/mint")
    //         cy.triggerDeleteButton(".list-item:nth-child(2) .dynamic-delete-button")

    //         cy.get(".list-item").contains("Aiḏaǧ")
    //         cy.get(".list-item").contains('Šīrāz')
    //         cy.get(".list-item").contains("Fārs").should("not.exist")
    //     })

    //     it("Still Deleted On Reload", function () {
    //         cy.visit("/editor/mint")

    //         cy.get(".list-item").contains("Aiḏaǧ")
    //         cy.get(".list-item").contains('Šīrāz')
    //         cy.get(".list-item").contains("Fārs").should("not.exist")
    //     })
    // })
})
