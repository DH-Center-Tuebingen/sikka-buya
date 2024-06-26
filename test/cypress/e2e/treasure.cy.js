
describe(`Treasures`, function () {


    this.beforeAll(function () {
        cy.task("MountMinimalDatabase").then(() => {
            cy.fixture("users/admin").then(user => {
                cy.setupAndLogin(user.email, user.password)
            })
        })
    })

    this.beforeEach(function () {
        cy.restoreLocalStorage()
    })

    it("Item in editor list", function () {
        cy.visit('/editor')
        cy.get(".list-item").contains("Schatzfunde")
    })

    it("Navigate to List", function () {
        cy.visit('/editor')
        cy.get(".list-item").contains("Schatzfunde").click()
        cy.location("pathname").should((pathname) => {
            expect(pathname).to.eq("/editor/treasure")
        })
        cy.get(".list-item").contains("Südufer Kasp. Meer")
    })

    it("List is showing", function () {
        cy.visit('/editor/treasure')

        cy.checkListItems(".list", [
            "Südufer Kasp. Meer",
            "Test"
        ])
    })

    it("List item is visible", function () {
        cy.visit('/editor/treasure')
        cy.get(".list-item").contains("Südufer Kasp. Meer").should("be.visible")
    })

    it("Can filter", function () {
        cy.visit('/editor/treasure')
        cy.get("input[type=search]").type("Süd")

        cy.checkListItems(".list", [
            "Südufer Kasp. Meer"
        ])
    })

    describe("Create Treasure", function () {

        it("Can reach create page", function () {
            cy.visit("/editor/treasure")
            cy.get("#create-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/treasure/create")
            })
            cy.get("h1").should("have.text", "Schatzfund")

        })


        it("Can cancel create", function () {
            cy.visit("/editor/treasure/create")
            cy.get("#treasure-name-input").type("xxxxx")
            cy.get("#cancel-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/treasure")
            })

            cy.checkListItems(".list", [
                "Südufer Kasp. Meer",
                "Test"
            ])
        })

        it("Can create new", function () {
            cy.visit("/editor/treasure/create")

            cy.setTreasureForm({
                name: "Cypress",
                description: "Eine Insel.",
                timespan: ["333", "338"],
                location: { x: 200, y: 200 },
                radius: 500000,
                items: [
                    {
                        add: true,
                        mintRegion: {
                            targetText: "Maharlu",
                            type: "maha"
                        },
                        epoch: {
                            targetText: "Stone Age",
                            type: "ston"
                        },
                        fragment: true,
                        weight: 9,
                        coinType: {
                            targetText: "Šīr389",
                            type: "sir"
                        },
                        count: 10,
                        mintRegionUncertain: true,
                        reconstructed: false,
                        mintAsOnCoin: "Maha"
                    },
                    {
                        add: true,

                        mintRegion: {
                            targetText: "Kavir",
                            type: "vir"
                        },
                        epoch: {
                            targetText: "Iron Age",
                            type: "Iron"
                        },
                        nominal: {
                            targetText: "Ruknī-Dinar",
                            type: "ruk"
                        },
                        material: {
                            targetText: "Gold",
                            type: "go"
                        },
                        yearUncertain: "3x5",
                        fragment: false,
                        weight: 5,
                        count: 3,
                        mintRegionUncertain: false,
                        reconstructed: true,
                        mintAsOnCoin: "Kavir"
                    }
                ]
            })



            cy.get("#submit-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/treasure")
            })

            cy.checkListItems(".list", [
                "Südufer Kasp. Meer",
                "Test",
                "Cypress"
            ])
        })

        it("Created treasure is correct", function () {
            cy.visit("/editor/treasure")
            cy.get(".list-item").contains("Cypress").click()

            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/treasure/3")
            })
            cy.get("h1").should("have.text", "Schatzfund")


            cy.checkTreasureForm({
                name: "Cypress",
                description: "Eine Insel.",
                timespan: ["333", "338"],
                location: [31.85, 39.60],
                radius: 500000,
                items: [
                    {
                        mintRegion: {
                            name: "Maharlu",
                            id: 1
                        },
                        epoch: {
                            name: "Stone Age",
                            id: 1
                        },
                        coinType: {
                            name: "Šīr389",
                            id: 4
                        },
                        nominal: {
                            name: "Dinar",
                            id: 1
                        },
                        material: {
                            name: "Silber",
                            id: 2
                        },
                        year: 389,
                        yearUncertain: "",
                        mintRegionUncertain: "",
                        fragment: true,
                        weight: 9,
                        count: 10,
                        mintRegionUncertain: true,
                        reconstructed: false,
                        mintAsOnCoin: "Maha"
                    },
                    {
                        coinType: {
                            name: "",
                            id: ""
                        },
                        mintRegion: {
                            name: "Kavir",
                            id: 2
                        },
                        epoch: {
                            name: "Iron Age",
                            id: 3
                        },
                        nominal: {
                            name: "Ruknī-Dinar",
                            id: 2
                        },
                        material: {
                            name: "Gold",
                            id: 1
                        },
                        year: "",
                        yearUncertain: "3x5",
                        mintRegionUncertain: "Kavir und Kerman",
                        fragment: false,
                        weight: 5,
                        count: 3,
                        mintRegionUncertain: false,
                        reconstructed: true,
                        mintAsOnCoin: "Kavir"
                    }
                ]
            })

        })

    })

    describe("Edit Treasure", function () {

        this.beforeAll(function () {
            cy.task("MountMinimalDatabase").then(() => {
                cy.fixture("users/admin").then(user => {
                    cy.login(user.email, user.password)
                })
            })
        })

        it("Access edit page", function () {
            cy.visit('/editor/treasure')
            cy.get(".list-item").contains("Test").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/treasure/2")
            })
            cy.get("#treasure-name-input").should("have.value", "Test")
        })

        it("Cannot edit with wrong id", function () {
            cy.visit('/editor/treasure/8')
            cy.get(".information.error").should("not.be.empty")
            cy.get("#submit-button").should("have.attr", "disabled")
        })


        describe("Cancel Update", function () {

            it("Can cancel update", function () {
                cy.visit('/editor/treasure/1')

                cy.setTreasureForm({
                    name: "Cypress",
                    description: "Eine Insel.",
                    timespan: ["333", "338"],
                    location: { x: 200, y: 200 },
                    radius: 500000,
                    items: [
                        {
                            mintRegion: {
                                targetText: "Maharlu",
                                type: "maha"
                            },
                            epoch: {
                                targetText: "Stone Age",
                                type: "ston"
                            },
                            fragment: true,
                            weight: 9,
                            coinType: {
                                targetText: "Šīr389",
                                type: "sir"
                            },
                            count: 10,
                            mintRegionUncertain: "",
                            reconstructed: true,
                            mintAsOnCoin: "Ma"
                        },
                        {
                            mintRegion: {
                                targetText: "Kavir",
                                type: "vir"
                            },
                            mintRegionUncertain: "Kavir und Kerman",
                            epoch: {
                                targetText: "Iron Age",
                                type: "Iron"
                            },
                            nominal: {
                                targetText: "Ruknī-Dinar",
                                type: "ruk"
                            },
                            material: {
                                targetText: "Gold",
                                type: "go"
                            },
                            yearUncertain: "3x5",
                            fragment: false,
                            weight: 5,
                            count: 3,
                            mintRegionUncertain: true,
                            reconstructed: false,
                            mintAsOnCoin: "Maa"
                        }
                    ]
                })

                cy.get("#cancel-button").click()
                cy.location("pathname").should((pathname) => {
                    expect(pathname).to.eq("/editor/treasure")
                })


                cy.checkListItems(".list", [
                    "Südufer Kasp. Meer",
                    "Test"
                ])
            })

            it("Cancelled treasure is still correct", function () {
                cy.visit('/editor/treasure/1')

                cy.checkTreasureForm({
                    name: "Südufer Kasp. Meer",
                    description: `<div style="text-align: center;"><b>Test</b></div><div style="text-align: left;">asd<b>sdasd</b>sdsd</div>`,
                    timespan: ["330", "390"],
                    location: [36.22, 53.22],
                    radius: 217000,
                    items: [
                        {
                            id: 3,
                            coinType: {
                                name: "Šīr389",
                                id: 4
                            },
                            count: 2,
                            fragment: true,
                            material: {
                                name: "Silber",
                                id: 2
                            },
                            //uncertain_mint,
                            nominal: {
                                name: "Dinar",
                                id: 1
                            },
                            //treasure_fk,
                            weight: 9,
                            year: 389,
                            yearUncertain: "",
                            mintRegion: {
                                name: "Maharlu",
                                id: 1
                            },
                            epoch: "",
                            reconstructed: false,
                            mintRegionUncertain: false,
                            mintAsOnCoin: "",
                        },
                        {
                            id: 4,
                            coinType: {
                                name: "",
                                id: ""
                            },
                            count: 10,
                            fragment: false,
                            material: {
                                name: "Gold",
                                id: 1
                            },
                            // uncertain_mint,
                            nominal: {
                                name: "",
                                id: ""
                            },
                            // treasure_fk,
                            weight: 60,
                            year: "",
                            yearUncertain: "3[3-9]x",
                            mintRegion: {
                                name: "Kavir",
                                id: 2
                            },
                            epoch: "",
                            reconstructed: false,
                            mintRegionUncertain: false,
                            mintAsOnCoin: "Shama",
                        }
                    ]
                })

            })
        })
        describe("Update Treasure", function () {

            it("Can update", function () {
                cy.visit('/editor/treasure/1')

                cy.setTreasureForm({
                    name: "Cypress",
                    description: "Eine Insel.",
                    timespan: ["333", "338"],
                    location: { x: 200, y: 200 },
                    radius: 500000,
                    items: [
                        {
                            mintRegion: {
                                targetText: "Kavir",
                                type: "vir"
                            },
                            mintAsOnCoin: "Kavir und Kerman",
                            epoch: {
                                targetText: "Iron Age",
                                type: "Iron"
                            },

                            fragment: false,
                            coinType: null,
                            year: "",
                            yearUncertain: "3x5",
                            nominal: null,
                            material: {
                                targetText: "Gold",
                                type: "go"
                            },
                            weight: 50,
                            count: 20,
                            reconstructed: false,
                            mintRegionUncertain: true
                        },
                        {
                            mintRegion: {
                                targetText: "Maharlu",
                                type: "maha"
                            },
                            epoch: {
                                targetText: "Stone Age",
                                type: "ston"
                            },
                            yearUncertain: "",
                            mintAsOnCoin: "",
                            fragment: true,
                            weight: 18,
                            coinType: {
                                targetText: "Šīr389",
                                type: "sir"
                            },
                            count: 10,
                            reconstructed: true,
                            mintRegionUncertain: false
                        },
                    ]
                })



                cy.get("#submit-button").click()
                cy.location("pathname").should((pathname) => {
                    expect(pathname).to.eq("/editor/treasure")
                })

                cy.checkListItems(".list", [
                    "Test",
                    "Cypress"
                ])
            })

            it("Updated treasure is correct", function () {
                cy.visit('/editor/treasure/1')

                cy.checkTreasureForm({
                    name: "Cypress",
                    description: `<div style="text-align: center;"><b>Eine Insel.</b></div>`,
                    timespan: ["333", "338"],
                    location: [31.85, 39.60],
                    radius: 500000,
                    items: [
                        {
                            mintRegion: {
                                name: "Kavir",
                                id: 2
                            },
                            mintAsOnCoin: "Kavir und Kerman",
                            epoch: {
                                name: "Iron Age",
                                id: 3
                            },
                            fragment: false,
                            coinType: {
                                name: "",
                                id: ""
                            },
                            year: "",
                            yearUncertain: "3x5",
                            nominal: {
                                name: "",
                                id: ""
                            },
                            material: {
                                name: "Gold",
                                id: 1
                            },
                            weight: 50,
                            count: 20,
                            mintRegionUncertain: true,
                            reconstructed: false
                        },
                        {
                            mintRegion: {
                                name: "Maharlu",
                                id: 1
                            },
                            mintAsOnCoin: "",
                            epoch: {
                                name: "Stone Age",
                                id: 1
                            },
                            fragment: true,
                            weight: 18,
                            coinType: {
                                name: "Šīr389",
                                id: 4
                            },
                            year: 389,
                            yearUncertain: "",
                            nominal: {
                                name: "Dinar",
                                id: 1
                            },
                            material: {
                                name: "Silber",
                                id: 2
                            },
                            count: 10,
                            reconstructed: true,
                            mintRegionUncertain: false,
                        }

                    ]
                })
            })

        })
    })


    describe("List Order", function () {

        this.beforeAll(function () {
            cy.task("MountMinimalDatabase").then(() => {
                cy.fixture("users/admin").then(user => {
                    cy.login(user.email, user.password)
                })
            })
        })

        it("List is in alphabetical order", function () {
            cy.visit("/editor/treasure")
            cy.get('.list-item .list-item-cell')
                .then($items => {
                    const arr = $items.map((_, html) => Cypress.$(html).text()).get()
                    return arr
                })
                .should('deep.eq', ["Südufer Kasp. Meer", "Test"])
        })
    })

    describe("Delete Treasure", function () {

        it("Delete", function () {
            cy.visit("/editor/treasure")
            cy.triggerDeleteButton(".list-item:nth-child(2) .dynamic-delete-button")
            cy.get(".list-item").contains("Südufer Kasp. Meer")
            cy.get(".list-item").contains("Test").should("not.exist")

        })

        it("Still Deleted On Reload", function () {
            cy.visit("/editor/treasure")
            cy.get(".list-item").contains("Südufer Kasp. Meer")
            cy.get(".list-item").contains("Test").should("not.exist")
        })
    })

})
