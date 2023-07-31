
const baseTemplate = require("../../../frontend/src/assets/template_types/base.json")

const createdTypeAvers = {
    fieldText: [
        "ح",
        "لا إله إلا الله",
        "بويه"
    ],
    innerInscript: [
        "خمس وستين وثلثمائة"
    ],
    intermediateInscript: [
        "اَنَا اللّٰہُ اَعلَمُ: میں اللہ",
        "اہل روم مغل گئے۔"
    ],
    outerInscript: [
        "Koran 30:4‒5",
        "قریب کی زمین میں۔ے۔",
        "تبھی اور"
    ],
    misc: [
        "Stern in Mitte",
        "ب کئے گئے۔"
    ]
}

const createdTypeReverse = {
    fieldText: [
        "لله",
        "محمد رسول الله",
    ],
    innerInscript: [
        "محمد رسول + Koran 9:33",
        "اللہ کے نام کے"
    ],
    intermediateInscript: [
        "عذاب آ جائے۔",
        "اپنی قوم کو ڈرا - Koran 71:1"
    ],
    outerInscript: [
        "اُس نے کہا۔",
        "second row"
    ],
    misc: [
        "He said, ‘O my people!"
    ]
}


function linesToDefaultFormattedText(arr) {

    return arr.map(val => {
        return `<div style="text-align: center;">${val}</div>`
    }).join("")
}



describe("Testing Type", function () {

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
        cy.get("a.list-item-row").contains("Typ")
    })

    it("Navigate to List", function () {
        cy.visit('/editor')
        cy.get("a.list-item-row").contains("Typ").click()
        cy.location("pathname").should((pathname) => {
            expect(pathname).to.eq("/editor/type")
        })

        cy.get(".list-item").contains('Šīr389')
    })

    it("Type list is showing", function () {
        cy.visit('/editor/type')
        cy.get(".list").children().should("have.length", 1)
    })

    it("List item is visible", function () {
        cy.visit('/editor/type')
        cy.get(".list-item").contains('Šīr389').should("be.visible")
    })


    describe("Done Button", function () {

        it("Can click button", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .done-button")
            completeButton.click()
            completeButton.find(".active").should("exist")
        })

        it("Other not active", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .reviewed-button")
            completeButton.find(".active").should("not.exist")
        })

        it("Still active on reload", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .done-button")
            completeButton.find(".active").should("exist")
        })

        it("Can disable button", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .done-button")
            completeButton.click()
            completeButton.find(".active").should("not.exist")
        })

        it("Still inactive on reload", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .done-button")
            completeButton.find(".active").should("not.exist")
        })

    })

    describe("Reviewed Button", function () {

        it("Can click button", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .reviewed-button")
            completeButton.click()
            completeButton.find(".active").should("exist")
        })

        it("Other not active", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .done-button")
            completeButton.find(".active").should("not.exist")
        })

        it("Still active on reload", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .reviewed-button")
            completeButton.find(".active").should("exist")
        })

        it("Can disable  button", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .reviewed-button")
            completeButton.click()
            completeButton.find(".active").should("not.exist")
        })

        it("Still inactive on reload", function () {
            cy.visit('/editor/type')
            const completeButton = cy.get("#list-item-type-4 .reviewed-button")
            completeButton.find(".active").should("not.exist")
        })

    })



    describe.only("Edit Type", function () {

        it("Access edit page", function () {
            cy.visit('/editor/type/edit/4')
            cy.get("#type-project-id").should("have.value", "Šīr389")
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/type/edit/4")
            })
        })

        it("Cannot edit with wrong id", function () {
            cy.visit('/editor/type/edit/8')
            cy.get("#type-id").should("be.empty")
            cy.get(".global.error").should("not.be.empty")
            cy.get("#type-main-submit-button").should("have.attr", "disabled")
        })


        it("Correct id set for update", function () {
            cy.visit('/editor/type/edit/4')
            cy.get("#type-id").should("have.value", 4)
        })


        it("Can cancel update", function () {
            cy.visit("/editor/type/edit/4")

            //We use a different name to not be in conflict with the created one
            cy.get("#type-project-id").clear().type("Fārs365Gb")

            cy.get("#type-main-cancel-button").click()
            cy.get(".confirmation").should("be.visible")
            cy.get(".confirmation .ok.button").click()

            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/type")
            })


            cy.get(".list-item").children().should("have.length", 1)
            cy.get(".list-item").contains("Šīr389")
        })



        it("Can update", function () {
            cy.visit("/editor/type/edit/4")

            //We use a different name to not be in conflict with the created one
            cy.get("#type-project-id").clear().type("Fārs365Gb")
            cy.get("#type-treadwell-id").clear().type("tFā365")

            cy.selectFromDataSelect("#type-mint-field", "Fārs", "fa")

            //Type as on Coin
            cy.clearRemovableInput("#type-as-on-coin-field")
            cy.get("#type-as-on-coin-field input[type=text]").type("Fāahrs")

            cy.get("#type-mint-uncertain label").click()

            cy.selectFromDataSelect("#type-material-data-field", "Gold", "go")

            cy.selectFromDataSelect("#type-nominal-data-field", "Ruknī-Dinar", "ni")
            cy.get("#type-purity input").clear().type("200")
            cy.get("#type-year-of-type-field input").clear().type("365")
            cy.get("#type-year-uncertain label").click()
            cy.get("#type-small label").click()

            cy.get("#type-donativ label").click()
            cy.get("#type-procedure").contains("gegossen").click()


            /**
             * Start Issuers
             */

            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1) .data-select.name", "ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad", "izz")
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-title-list .data-select.title", "malik")

            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-title-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-title-list .list-item:nth-child(2) .data-select.title", "šāhānšāh", "sah")


            cy.removeNthListItem("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list", 2)
            cy.removeNthListItem("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list", 1)


            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list .data-select.honorific", "… ad-Daula")

            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list .list-item:nth-child(2) .data-select.honorific", "… al-Mulūk", "mu")


            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(2) .data-select.name", 'ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad')

            cy.removeNthListItem("#type-issuers-list > .list-container  .list-item:nth-child(2)  .titled-person-title-list", 1)
            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(2)  .titled-person-title-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(2)  .titled-person-title-list .data-select.title", "malik")

            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(2)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(2)  .titled-person-honorific-list .data-select.honorific", "… ad-Daula")


            /**
            * Start Overlord
            */
            cy.get("#type-overlord-list > .wrapper > .title-row > .list-add-button-besides").click()

            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1) .data-select.name", "Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya", "al-has")

            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-title-list > .list-add-button-below").click()
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-title-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-title-list .list-item:nth-child(2) .data-select.title", "malik")
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-title-list .list-item:nth-child(1) .data-select.title", "šāhānšāh", "sah")

            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-honorific-list .data-select.honorific", "… al-Mulūk", "mu")

            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-honorific-list .list-item:nth-child(2) .data-select.honorific", "… ad-Daula")

            // // Second Overlord
            cy.get("#type-overlord-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(2) .data-select.name", "Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz", "ta")
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(2)  .titled-person-title-list > .list-add-button-below").click()
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(2)  .titled-person-title-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(2)  .titled-person-title-list .list-item:nth-child(1) .data-select.title", "malik", "malik")
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(2)  .titled-person-title-list .list-item:nth-child(2) .data-select.title", "šāhānšāh", "sah")


            // // Third overlord
            cy.get("#type-overlord-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list > .list-container  .list-item:nth-child(3) .data-select.name", "ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad", "ABU")
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(3)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(3)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(3)  .titled-person-honorific-list .list-item:nth-child(1) .data-select.honorific", "… ad-Daula")
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(3)  .titled-person-honorific-list .list-item:nth-child(2) .data-select.honorific", "… al-Mulūk", "lu")



            cy.selectFromDataSelect("#type-caliph-field", 'al-Qādir bi-᾽llāh, Abu ᾽l-ʿAbbās Aḥmad b. Isḥāq', "qa")

            cy.get("#type-other-person-list > .list-add-button-below").click()
            cy.get("#type-other-person-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-other-person-list > .list-container  .list-item:nth-child(1)", 'Abu ’l-Ḥasan Muḥammad b. al-Mustakfī', "muSta")
            cy.selectFromDataSelect("#type-other-person-list > .list-container  .list-item:nth-child(2)", 'Abu ’l-Ḥasan Muḥammad b. al-Mustakfī', "muSta")



            /**
             * Coin Side Avers
             */
            cy.typeCoinSideField("#type-avers", createdTypeAvers)

            /**
             * Coin Side Reverse
             */
            cy.typeCoinSideField("#type-reverse", createdTypeReverse)

            cy.triggerDeleteButton("#type-specials .dynamic-delete-button")
            cy.typeLines("#type-specials .formatted-text-area", [
                "Av. extraordinary",
                "",
                "Rev. unusual line:  لئے والا ہوں۔"
            ])


            cy.get("#type-cursive label").click()


            cy.selectFromDataSelect("#type-coin-mark-list > .list-container  .list-item:nth-child(1) .data-select", "bāʾ/tāʾ/ṯāʾ", "tā")
            cy.selectFromDataSelect("#type-coin-mark-list > .list-container  .list-item:nth-child(2) .data-select", "drei Punkte (∴)", "dre")


            cy.get("#type-coin-verse-list .list-add-button-below").click().click()

            cy.selectFromDataSelect("#type-coin-verse-list > .list-container  .list-item:nth-child(1) .data-select", "Koran 30:4‒5", "ko")
            cy.selectFromDataSelect("#type-coin-verse-list > .list-container  .list-item:nth-child(2) .data-select", "محمد رسول الله")




            cy.get("#type-pieces-list > .list-container  .list-item:nth-child(1) .pieces-input").clear().type("https://www.fint-ikmk.uni-tuebingen.de/ikmk/object?lang=de&id=ID92")
            cy.get("#type-pieces-list > .list-container  .list-item:nth-child(2) .pieces-input").clear().type("https://www.fint-ikmk.uni-tuebingen.de/ikmk/object?lang=de&id=ID81")


            cy.triggerDeleteButton("#type-literature-field .dynamic-delete-button")

            cy.typeLines("#type-literature-field .formatted-text-area", ["Besondere Zeichen", "#+-!\"§$%&/()=?"])

            cy.triggerDeleteButton("#type-internal-notes-field .dynamic-delete-button")

            cy.typeLines("#type-internal-notes-field .formatted-text-area", ["Diese Zeichen können verwendet werden", "#+-!\"§$%&/()=?"])


            cy.get("#exclude-from-type-catalog label").click()
            cy.get("#exclude-from-map-app label").click()

            cy.get("#type-main-submit-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/type")
            })

            cy.get(".list-item").children().should("have.length", 1)

        })


        it("Updated type should be correct", function () {
            cy.visit("/editor/type/edit/4")

            // This differs from the created type as this type has it was Fārs365Ga to not have a conflict if both are present.
            cy.get("#type-project-id").should("have.value", "Fārs365Gb")
            cy.get("#type-treadwell-id").should("have.value", "tFā365")

            cy.checkDataSelect("#type-mint-field", "Fārs", 2)
            cy.get("#type-as-on-coin-field input[type=text]").should("have.value", "Fāahrs")

            // This differs from the created type as this type has it checked in the beginning:
            cy.get("#checkbox-type-mint-uncertain").should("not.be.checked")

            cy.checkDataSelect("#type-material-data-field", "Gold", 1)
            cy.checkDataSelect("#type-nominal-data-field", "Ruknī-Dinar", 2)
            cy.get("#type-purity input").should("have.value", "200")



            cy.get("#type-year-of-type-field input").should("have.value", "365")
            cy.get("#type-year-uncertain input[type=checkbox]").should("not.be.checked")

            // This differs from the created type as this type has it checked in the beginning:
            cy.get("#type-donativ input[type=checkbox]").should("not.be.checked")
            cy.get("#type-small  input[type=checkbox]").should("be.checked")
            cy.get("#type-procedure").contains("gegossen").parent(".radio-button").find("input[type=radio]").should("be.checked")


            cy.checkPersonList("#type-issuers-list", [
                {
                    id: 4,
                    name: "ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad",
                    titles: [
                        {
                            id: 1,
                            name: 'malik'
                        },
                        {
                            id: 2,
                            name: 'šāhānšāh'
                        }
                    ],
                    honorifics: [
                        {
                            id: 1,
                            name: "… ad-Daula"
                        }, {
                            id: 3,
                            name: "… al-Mulūk"
                        },
                    ]
                }, {
                    id: 5,
                    name: "ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad",
                    titles: [
                        {
                            id: 1,
                            name: 'malik'
                        },
                    ],
                    honorifics: [
                        {
                            id: 1,
                            name: "… ad-Daula"
                        },
                    ]
                }
            ])

            cy.checkPersonList("#type-overlord-list", [
                {
                    id: 1,
                    name: "Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya",
                    titles: [
                        {
                            id: 2,
                            name: 'šāhānšāh'
                        }, {
                            id: 1,
                            name: 'malik'
                        },
                    ],
                    honorifics: [
                        {
                            id: 3,
                            name: "… al-Mulūk"
                        },
                        {
                            id: 1,
                            name: "… ad-Daula"
                        },
                    ]
                }, {
                    id: 2,
                    name: "Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz",
                    titles: [
                        {
                            id: 1,
                            name: 'malik'
                        },
                        {
                            id: 2,
                            name: 'šāhānšāh'
                        },
                    ],
                    honorifics: []
                }, {
                    id: 4,
                    name: "ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad",
                    titles: [],
                    honorifics: [
                        {
                            id: 1,
                            name: "… ad-Daula"
                        }, {
                            id: 3,
                            name: "… al-Mulūk"
                        },
                    ]
                }
            ])

            // This differs from the created type as this type has it checked in the beginning:
            cy.checkDataSelect("#type-caliph-field", "al-Qādir bi-᾽llāh, Abu ᾽l-ʿAbbās Aḥmad b. Isḥāq", 7)

            cy.checkDataSelectList("#type-other-person-list", [
                {
                    id: 6,
                    name: "Abu ’l-Ḥasan Muḥammad b. al-Mustakfī"
                }, {
                    id: 6,
                    name: "Abu ’l-Ḥasan Muḥammad b. al-Mustakfī"
                },
            ])





            cy.checkCoinSideField("#type-avers", {
                fieldText: linesToDefaultFormattedText(createdTypeAvers.fieldText),
                innerInscript: linesToDefaultFormattedText(createdTypeAvers.innerInscript),
                intermediateInscript: linesToDefaultFormattedText(createdTypeAvers.intermediateInscript),
                outerInscript: linesToDefaultFormattedText(createdTypeAvers.outerInscript),
                misc: linesToDefaultFormattedText(createdTypeAvers.misc),
            })

            cy.checkCoinSideField("#type-reverse", {
                fieldText: linesToDefaultFormattedText(createdTypeReverse.fieldText),
                innerInscript: linesToDefaultFormattedText(createdTypeReverse.innerInscript),
                intermediateInscript: linesToDefaultFormattedText(createdTypeReverse.intermediateInscript),
                outerInscript: linesToDefaultFormattedText(createdTypeReverse.outerInscript),
                misc: linesToDefaultFormattedText(createdTypeReverse.misc),
            })




            cy.checkFormattedTextArea("#type-specials",
                `<div style="text-align: center;">Av. extraordinary</div><div style="text-align: center;"><br></div><div style="text-align: center;">Rev. unusual line:&nbsp; لئے والا ہوں۔</div>`
            )

            // This differs from the created type as this type has it checked in the beginning:
            cy.get("#type-cursive input[type=checkbox]").should("not.be.checked")
            cy.checkDataSelectList("#type-coin-mark-list", [
                { id: 2, name: 'bāʾ/tāʾ/ṯāʾ' },
                { id: 1, name: 'drei Punkte (∴)' },

            ])
            cy.checkList("#type-pieces-list", [
                "https://www.fint-ikmk.uni-tuebingen.de/ikmk/object?lang=de&id=ID92",
                "https://www.fint-ikmk.uni-tuebingen.de/ikmk/object?lang=de&id=ID81"
            ])

            cy.checkFormattedTextArea("#type-literature-field", linesToDefaultFormattedText(["Besondere Zeichen", "#+-!\"§$%&amp;/()=?"]))
            cy.checkFormattedTextArea("#type-internal-notes-field", linesToDefaultFormattedText(["Diese Zeichen können verwendet werden", "#+-!\"§$%&amp;/()=?"]))

            cy.get("#exclude-from-type-catalog input[type=checkbox]").should("be.checked")
            cy.get("#exclude-from-map-app input[type=checkbox]").should("be.checked")
        })

    })



    describe("Create Type", function () {

        this.beforeAll(function () {
            cy.task("MountMinimalDatabase")
            cy.fixture("users/admin").then(user => {
                cy.login(user.email, user.password)
            })
        })

        it("Can reach create page", function () {
            cy.visit("/editor/type")
            cy.get("#create-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/type/create")
            })

            cy.get("#type-id").should("have.value", "")
            cy.get("#type-project-id").should("have.value", "")
            cy.get("#type-treadwell-id").should("have.value", "")

            cy.checkDataSelect("#type-mint-field")
            cy.get("#type-as-on-coin-field input[type=text]").should("have.value", "")
            cy.get("#checkbox-type-mint-uncertain").should("not.be.checked")

            cy.checkDataSelect("#type-material-data-field", "Silber", 6)
            cy.checkDataSelect("#type-nominal-data-field", "Dirham", 11)
            cy.get("#type-year-of-type-field").should("have.value", "")
            cy.get("#type-year-uncertain input[type=checkbox]").should("not.be.checked")
            cy.get("#type-donativ input[type=checkbox]").should("not.be.checked")
            cy.get("#type-procedure ").contains("geprägt").parent(".radio-button").find("input[type=radio]").should("be.checked")

            cy.checkEmptyList("#type-issuers-list")
            cy.checkEmptyList("#type-overlord-list")
            cy.checkDataSelect("#type-caliph-field")
            cy.checkEmptyList("#type-other-person-list")


            cy.checkCoinSideField("#type-avers", baseTemplate.avers)
            cy.checkCoinSideField("#type-reverse", baseTemplate.reverse)

            cy.checkFormattedTextArea("#type-specials", baseTemplate.specials)

            cy.get("#type-cursive input[type=checkbox]").should("not.be.checked")
            cy.checkEmptyList("#type-coin-mark-list")
            cy.checkEmptyList("#type-pieces-list")

            cy.checkFormattedTextArea("#type-literature-field")
            cy.checkFormattedTextArea("#type-internal-notes-field")

            cy.get("#exclude-from-type-catalog input[type=checkbox]").should("not.be.checked")
            cy.get("#exclude-from-map-app input[type=checkbox]").should("not.be.checked")

            cy.get("button#type-main-cancel-button").should("not.be.disabled")
            cy.get("button#type-main-submit-button").should("not.be.disabled")
        })

        it("Show warning on cancel.", function () {
            cy.visit("/editor/type/create")
            cy.get("#type-main-cancel-button").click()
            cy.get(".modal .confirmation .text").should("have.text", "Wollen Sie die Seite wirklich verlassen? Alle Änderungen gehen dabei verloren!")
            cy.get(".modal .confirmation .cancel.button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/type/create")
            })
        })


        it("Can cancel create", function () {
            cy.visit("/editor/type/create")

            cy.get("#type-project-id").type("xxxxx")

            cy.get("#type-main-cancel-button").click()
            cy.get(".modal .ok.button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/type")
            })
            cy.get(".list-item").contains('Šīr389').should("exist")
            cy.get(".list-item").children().should("have.length", 1)
        })

        it("Can create new type", function () {
            cy.visit("/editor/type/create")

            cy.get("#type-project-id").type("Fārs365Ga")
            cy.get("#type-treadwell-id").type("tFā365")

            cy.selectFromDataSelect("#type-mint-field", "Fārs", "fa")

            //Type as on Coin
            cy.get("#type-as-on-coin-field input[type=text]").should("have.value", "Fārs")
            cy.clearRemovableInput("#type-as-on-coin-field")
            cy.get("#type-as-on-coin-field input[type=text]").type("Fāahrs")

            cy.get("#type-mint-uncertain label").click()

            cy.selectFromDataSelect("#type-material-data-field", "Gold", "go")
            'Ruknī-Dinar'

            cy.selectFromDataSelect("#type-nominal-data-field", "Ruknī-Dinar", "ni")
            cy.get("#type-year-of-type-field input").type("365")
            cy.get("#type-year-uncertain label").click()
            cy.get("#type-donativ label").click()
            cy.get("#type-procedure").contains("gegossen").click()


            /**
             * Start Issuers
             */

            cy.get("#type-issuers-list > .wrapper > .title-row > .list-add-button-besides").click()
            cy.get("#type-issuers-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1) .data-select.name", "ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad", "izz")

            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-title-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-title-list .data-select.title", "malik")

            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-title-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-title-list .list-item:nth-child(2) .data-select.title", "šāhānšāh", "sah")

            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list .data-select.honorific", "… ad-Daula")

            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(1)  .titled-person-honorific-list .list-item:nth-child(2) .data-select.honorific", "… al-Mulūk", "mu")


            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(2) .data-select.name", 'ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad')

            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(2)  .titled-person-title-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(2)  .titled-person-title-list .data-select.title", "malik")

            cy.get("#type-issuers-list > .list-container  .list-item:nth-child(2)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-issuers-list > .list-container  .list-item:nth-child(2)  .titled-person-honorific-list .data-select.honorific", "… ad-Daula")


            /**
            * Start Overlord
            */
            cy.get("#type-overlord-list > .wrapper > .title-row > .list-add-button-besides").click()

            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1) .data-select.name", "Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya", "al-has")

            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-title-list > .list-add-button-below").click()
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-title-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-title-list .list-item:nth-child(2) .data-select.title", "malik")
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-title-list .list-item:nth-child(1) .data-select.title", "šāhānšāh", "sah")

            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-honorific-list .data-select.honorific", "… al-Mulūk", "mu")

            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(1)  .titled-person-honorific-list .list-item:nth-child(2) .data-select.honorific", "… ad-Daula")

            // // Second Overlord
            cy.get("#type-overlord-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(2) .data-select.name", "Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz", "ta")
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(2)  .titled-person-title-list > .list-add-button-below").click()
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(2)  .titled-person-title-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(2)  .titled-person-title-list .list-item:nth-child(1) .data-select.title", "malik", "malik")
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(2)  .titled-person-title-list .list-item:nth-child(2) .data-select.title", "šāhānšāh", "sah")


            // // Third overlord
            cy.get("#type-overlord-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list > .list-container  .list-item:nth-child(3) .data-select.name", "ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad", "ABU")
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(3)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.get("#type-overlord-list> .list-container  .list-item:nth-child(3)  .titled-person-honorific-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(3)  .titled-person-honorific-list .list-item:nth-child(1) .data-select.honorific", "… ad-Daula")
            cy.selectFromDataSelect("#type-overlord-list> .list-container  .list-item:nth-child(3)  .titled-person-honorific-list .list-item:nth-child(2) .data-select.honorific", "… al-Mulūk", "lu")



            cy.selectFromDataSelect("#type-caliph-field", "al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir", "muti")

            cy.get("#type-other-person-list > .list-add-button-below").click()
            cy.get("#type-other-person-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-other-person-list > .list-container  .list-item:nth-child(1)", 'Abu ’l-Ḥasan Muḥammad b. al-Mustakfī', "muSta")
            cy.selectFromDataSelect("#type-other-person-list > .list-container  .list-item:nth-child(2)", 'Abu ’l-Ḥasan Muḥammad b. al-Mustakfī', "muSta")



            /**
             * Coin Side Avers
             */
            cy.typeCoinSideField("#type-avers", createdTypeAvers)

            /**
             * Coin Side Reverse
             */
            cy.typeCoinSideField("#type-reverse", createdTypeReverse)


            cy.typeLines("#type-specials .formatted-text-area", [
                "Av. extraordinary",
                "",
                "Rev. unusual line:  لئے والا ہوں۔"
            ])


            cy.get("#type-cursive label").click()



            cy.get("#type-coin-mark-list > .list-add-button-below").click()
            cy.get("#type-coin-mark-list > .list-add-button-below").click()
            cy.selectFromDataSelect("#type-coin-mark-list > .list-container  .list-item:nth-child(1) .data-select", "bāʾ/tāʾ/ṯāʾ", "ba")
            cy.selectFromDataSelect("#type-coin-mark-list > .list-container  .list-item:nth-child(2) .data-select", "drei Punkte (∴)", "dre")



            cy.get("#type-pieces-list > .list-add-button-below").click()
            cy.get("#type-pieces-list > .list-add-button-below").click()

            cy.get("#type-pieces-list > .list-container  .list-item:nth-child(1) .pieces-input").type("https://www.fint-ikmk.uni-tuebingen.de/ikmk/object?lang=de&id=ID92")
            cy.get("#type-pieces-list > .list-container  .list-item:nth-child(2) .pieces-input").type("https://www.fint-ikmk.uni-tuebingen.de/ikmk/object?lang=de&id=ID81")


            cy.typeLines("#type-literature-field .formatted-text-area", ["Besondere Zeichen", "#+-!\"§$%&/()=?"])
            cy.typeLines("#type-internal-notes-field .formatted-text-area", ["Diese Zeichen können verwendet werden", "#+-!\"§$%&/()=?"])


            cy.get("#exclude-from-type-catalog label").click()
            cy.get("#exclude-from-map-app label").click()

            cy.get("#type-main-submit-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/type")
            })

            cy.get(".list-item").children().should("have.length", 2)
        })


        it("Created type should be correct", function () {
            cy.visit("/editor/type/edit/5")

            cy.get("#type-project-id").should("have.value", "Fārs365Ga")
            cy.get("#type-treadwell-id").should("have.value", "tFā365")

            cy.checkDataSelect("#type-mint-field", "Fārs", 2)
            cy.get("#type-as-on-coin-field input[type=text]").should("have.value", "Fāahrs")
            cy.get("#checkbox-type-mint-uncertain").should("be.checked")

            cy.checkDataSelect("#type-material-data-field", "Gold", 1)
            cy.checkDataSelect("#type-nominal-data-field", "Ruknī-Dinar", 2)
            cy.get("#type-year-of-type-field input").should("have.value", "365")
            cy.get("#type-year-uncertain input[type=checkbox]").should("be.checked")
            cy.get("#type-donativ input[type=checkbox]").should("be.checked")
            cy.get("#type-procedure").contains("gegossen").parent(".radio-button").find("input[type=radio]").should("be.checked")


            cy.checkPersonList("#type-issuers-list", [
                {
                    id: 4,
                    name: "ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad",
                    titles: [
                        {
                            id: 1,
                            name: 'malik'
                        },
                        {
                            id: 2,
                            name: 'šāhānšāh'
                        }
                    ],
                    honorifics: [
                        {
                            id: 1,
                            name: "… ad-Daula"
                        }, {
                            id: 3,
                            name: "… al-Mulūk"
                        },
                    ]
                }, {
                    id: 5,
                    name: "ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad",
                    titles: [
                        {
                            id: 1,
                            name: 'malik'
                        },
                    ],
                    honorifics: [
                        {
                            id: 1,
                            name: "… ad-Daula"
                        },
                    ]
                }
            ])

            cy.checkPersonList("#type-overlord-list", [
                {
                    id: 1,
                    name: "Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya",
                    titles: [
                        {
                            id: 2,
                            name: 'šāhānšāh'
                        }, {
                            id: 1,
                            name: 'malik'
                        },
                    ],
                    honorifics: [
                        {
                            id: 3,
                            name: "… al-Mulūk"
                        },
                        {
                            id: 1,
                            name: "… ad-Daula"
                        },
                    ]
                }, {
                    id: 2,
                    name: "Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz",
                    titles: [
                        {
                            id: 1,
                            name: 'malik'
                        },
                        {
                            id: 2,
                            name: 'šāhānšāh'
                        },
                    ],
                    honorifics: []
                }, {
                    id: 4,
                    name: "ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad",
                    titles: [],
                    honorifics: [
                        {
                            id: 1,
                            name: "… ad-Daula"
                        }, {
                            id: 3,
                            name: "… al-Mulūk"
                        },
                    ]
                }
            ])

            cy.checkDataSelect("#type-caliph-field", "al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir", 3)

            cy.checkDataSelectList("#type-other-person-list", [
                {
                    id: 6,
                    name: "Abu ’l-Ḥasan Muḥammad b. al-Mustakfī"
                }, {
                    id: 6,
                    name: "Abu ’l-Ḥasan Muḥammad b. al-Mustakfī"
                },
            ])





            cy.checkCoinSideField("#type-avers", {
                fieldText: linesToDefaultFormattedText(createdTypeAvers.fieldText),
                innerInscript: linesToDefaultFormattedText(createdTypeAvers.innerInscript),
                intermediateInscript: linesToDefaultFormattedText(createdTypeAvers.intermediateInscript),
                outerInscript: linesToDefaultFormattedText(createdTypeAvers.outerInscript),
                misc: linesToDefaultFormattedText(createdTypeAvers.misc),
            })

            cy.checkCoinSideField("#type-reverse", {
                fieldText: linesToDefaultFormattedText(createdTypeReverse.fieldText),
                innerInscript: linesToDefaultFormattedText(createdTypeReverse.innerInscript),
                intermediateInscript: linesToDefaultFormattedText(createdTypeReverse.intermediateInscript),
                outerInscript: linesToDefaultFormattedText(createdTypeReverse.outerInscript),
                misc: linesToDefaultFormattedText(createdTypeReverse.misc),
            })




            cy.checkFormattedTextArea("#type-specials",
                `<div>Av. extraordinary</div><div><br></div><div>Rev. unusual line:&nbsp; لئے والا ہوں۔</div>`
            )

            cy.get("#type-cursive input[type=checkbox]").should("be.checked")
            cy.checkDataSelectList("#type-coin-mark-list", [
                { id: 2, name: 'bāʾ/tāʾ/ṯāʾ' },
                { id: 1, name: 'drei Punkte (∴)' },

            ])
            cy.checkList("#type-pieces-list", [
                "https://www.fint-ikmk.uni-tuebingen.de/ikmk/object?lang=de&id=ID92",
                "https://www.fint-ikmk.uni-tuebingen.de/ikmk/object?lang=de&id=ID81"
            ])

            cy.checkFormattedTextArea("#type-literature-field", linesToDefaultFormattedText(["Besondere Zeichen", "#+-!\"§$%&amp;/()=?"]))
            cy.checkFormattedTextArea("#type-internal-notes-field", linesToDefaultFormattedText(["Diese Zeichen können verwendet werden", "#+-!\"§$%&amp;/()=?"]))

            cy.get("#exclude-from-type-catalog input[type=checkbox]").should("be.checked")
            cy.get("#exclude-from-map-app input[type=checkbox]").should("be.checked")
        })

    })


    describe("List Order", function () {
        it("List is in alphabetical order", function () {
            cy.visit("/editor/type")
            cy.get('.list-item .list-item-cell')
                .then($items => {
                    const arr = $items.map((_, html) => Cypress.$(html).text().trim()).get()
                    return arr
                })
                .should('deep.eq', ["Fārs365Ga", "Šīr389"])
        })
    })

    describe("Delete Type", function () {

        this.beforeAll(function () {
            cy.task("MountMinimalDatabaseWithCreatedType")
        })

        it("Delete", function () {
            cy.visit("/editor/type")
            cy.get(".list-item").should("have.length", 2)
            cy.triggerDeleteButton(".list-item:nth-child(1) .dynamic-delete-button")
            cy.get(".list-item").contains('Šīr389').should("exist")
            cy.get(".list-item").children().should("have.length", 1)

        })

        it("Still Deleted On Reload", function () {
            cy.visit("/editor/type")
            cy.get(".list-item").should("have.length", 1)
            cy.get(".list-item").contains('Šīr389').should("exist")
        })
    })
})
