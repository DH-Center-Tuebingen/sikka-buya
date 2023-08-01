describe("Testing Person", function () {

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
        cy.get(".list-item").contains("Person")
    })

    it("Navigate to List", function () {
        cy.visit('/editor')
        cy.get(".list-item").contains("Person").click()
        cy.location("pathname").should((pathname) => {
            expect(pathname).to.eq("/editor/person")
        })

        cy.get(".list-item").contains('Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 0, 255)")
        cy.get(".list-item").contains('Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(0, 255, 255)")
        cy.get(".list-item").contains('al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 0)")
        cy.get(".list-item").contains('ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(209, 74, 70)")
        cy.get(".list-item").contains('ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 169, 83)")
        cy.get(".list-item").contains('Abu ’l-Ḥasan Muḥammad b. al-Mustakfī').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")
        cy.get(".list-item").contains('al-Qādir bi-᾽llāh, Abu ᾽l-ʿAbbās Aḥmad b. Isḥāq').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")
    })

    it("Person list is showing", function () {
        cy.visit('/editor/person')
        cy.get(".list").children().should("have.length", 7)
    })

    it("List item is visible", function () {
        cy.visit('/editor/person')
        cy.get(".list-item").contains('Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya').should("be.visible")
    })

    it("Can filter", function () {
        cy.visit('/editor/person')
        cy.get("input[type=search]").type("ad-Daula")
        cy.get(".list-item").contains('Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya')
        cy.get(".list-item").contains('Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz')
        cy.get(".list-item").contains('ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad')
        cy.get(".list-item").contains('ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad')

        cy.get(".list").children().should("have.length", 4)
    })

    describe("Create Person", function () {

        it("Can reach create page", function () {
            cy.visit("/editor/person")
            cy.get("#create-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/person/create")
            })
            cy.get("#person-id").should("have.value", "-1")
            cy.get("#person-name").should("have.value", "")
            cy.get("#person-short-name").should("have.value", "")
            cy.get("#person-role .data-select-id").should("have.value", "")
            cy.get("#person-dynasty .data-select-id").should("have.value", "")
            cy.get("#person-color input[type=text]").should("have.value", "000000")
            cy.get("#person-color input[type=color]").should("have.value", "#000000")


        })


        it("Can cancel create", function () {
            cy.visit("/editor/person/create")

            cy.get("#person-name").type("xxxxx")
            cy.get("#person-short-name").type("xxxxx")

            cy.selectFromDataSelect("#person-role", "heir")

            cy.selectFromDataSelect("#person-dynasty", 'Būyide')
            cy.get("#person-color input[type=text]").clear().type("ffff00")

            cy.get("#cancel-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/person")
            })
            cy.get(".list-item").contains('Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 0, 255)")
            cy.get(".list-item").contains('Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(0, 255, 255)")
            cy.get(".list-item").contains('al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 0)")
            cy.get(".list-item").contains('ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(209, 74, 70)")
            cy.get(".list-item").contains('ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 169, 83)")
            cy.get(".list-item").contains('Abu ’l-Ḥasan Muḥammad b. al-Mustakfī').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")
            cy.get(".list-item").contains('al-Qādir bi-᾽llāh, Abu ᾽l-ʿAbbās Aḥmad b. Isḥāq').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")

            cy.get(".list-item").children().should("have.length", 7)
        })

        it("Can create new person", function () {
            cy.visit("/editor/person/create")

            cy.get("#person-name").type("al-Mustakfī bi-᾽llāh, Abu ᾽l-Qāsim ʿAbdallāh b. al-Muktafī")
            cy.get("#person-short-name").type("al-Mustakfī")

            cy.selectFromDataSelect("#person-role", "caliph")

            cy.selectFromDataSelect("#person-dynasty", 'ʿAbbāside')
            cy.get("#person-color input[type=text]").clear().type("13ce56")

            cy.get("#submit-button").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/person")
            })
            cy.get(".list-item").contains('Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 0, 255)")
            cy.get(".list-item").contains('Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(0, 255, 255)")
            cy.get(".list-item").contains('al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 0)")
            cy.get(".list-item").contains('ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(209, 74, 70)")
            cy.get(".list-item").contains('ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 169, 83)")
            cy.get(".list-item").contains('Abu ’l-Ḥasan Muḥammad b. al-Mustakfī').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")
            cy.get(".list-item").contains('al-Qādir bi-᾽llāh, Abu ᾽l-ʿAbbās Aḥmad b. Isḥāq').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")
            cy.get(".list-item").contains("al-Mustakfī bi-᾽llāh, Abu ᾽l-Qāsim ʿAbdallāh b. al-Muktafī").parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(19, 206, 86)")

            cy.get(".list-item").children().should("have.length", 8)
        })

        it("Created person should be correct", function () {
            cy.visit("/editor/person/8")

            cy.get("#person-id").should("have.value", 8)
            cy.get("#person-name").should("have.value", "al-Mustakfī bi-᾽llāh, Abu ᾽l-Qāsim ʿAbdallāh b. al-Muktafī")
            cy.get("#person-short-name").should("have.value", "al-Mustakfī")
            cy.get("#person-role .name-field").should("have.value", "caliph")
            cy.get("#person-role .data-select-id").should("have.value", 5)
            cy.get("#person-dynasty .name-field").should("have.value", "ʿAbbāside")
            cy.get("#person-dynasty .data-select-id").should("have.value", 2)
            cy.get("#person-color input[type=text]").should("have.value", "13ce56")
        })

    })

    describe("Edit Person", function () {

        it("Access edit page", function () {
            cy.visit('/editor/person')
            cy.get(".list-item").contains("al-Mustakfī bi-᾽llāh, Abu ᾽l-Qāsim ʿAbdallāh b. al-Muktafī").click()
            cy.location("pathname").should((pathname) => {
                expect(pathname).to.eq("/editor/person/8")
            })
        })

        it("Cannot edit with wrong id", function () {
            cy.visit('/editor/person/120')
            cy.get(".information.error").should("not.be.empty")
            cy.get("#submit-button").should("have.attr", "disabled")
        })


        it("Correct id set for update", function () {
            cy.visit('/editor/person/8')
            cy.get("#person-id").should("have.value", 8)
        })


        it("Can cancel update", function () {
            cy.visit('/editor/person/8')

            cy.get("#person-name").type("Abu ’l-Wafāʾ Tuzun")
            cy.get("#person-short-name").type("Tuzun")

            cy.selectFromDataSelect("#person-role", "cutter")

            cy.selectFromDataSelect("#person-dynasty", 'Būyide')
            cy.get("#person-color input[type=text]").clear().type("ff0000")

            cy.get("#cancel-button").click()
            cy.get(".list-item").contains('Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 0, 255)")
            cy.get(".list-item").contains('Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(0, 255, 255)")
            cy.get(".list-item").contains('al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 0)")
            cy.get(".list-item").contains('ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(209, 74, 70)")
            cy.get(".list-item").contains('ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 169, 83)")
            cy.get(".list-item").contains('Abu ’l-Ḥasan Muḥammad b. al-Mustakfī').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")
            cy.get(".list-item").contains('al-Qādir bi-᾽llāh, Abu ᾽l-ʿAbbās Aḥmad b. Isḥāq').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")
            cy.get(".list-item").contains("al-Mustakfī bi-᾽llāh, Abu ᾽l-Qāsim ʿAbdallāh b. al-Muktafī").parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(19, 206, 86)")

            cy.get(".list-item").children().should("have.length", 8)
        })



        it("Can update", function () {
            cy.visit('/editor/person/8')

            cy.get("#person-name").clear().type("Abu ’l-Wafāʾ Tuzun")
            cy.get("#person-short-name").clear().type("Tuzun")

            cy.selectFromDataSelect("#person-role", "cutter")

            cy.selectFromDataSelect("#person-dynasty", 'Būyide')
            cy.get("#person-color input[type=text]").clear().type("ff0000")

            cy.get("#submit-button").click()
            cy.get(".list-item").contains('Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 0, 255)")
            cy.get(".list-item").contains('Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(0, 255, 255)")
            cy.get(".list-item").contains('al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 0)")
            cy.get(".list-item").contains('ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(209, 74, 70)")
            cy.get(".list-item").contains('ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 169, 83)")
            cy.get(".list-item").contains('Abu ’l-Ḥasan Muḥammad b. al-Mustakfī').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")
            cy.get(".list-item").contains('al-Qādir bi-᾽llāh, Abu ᾽l-ʿAbbās Aḥmad b. Isḥāq').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 255)")
            cy.get(".list-item").contains("Abu ’l-Wafāʾ Tuzun").parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 0, 0)")

            cy.get(".list-item").children().should("have.length", 8)
        })

        it("Updated person should be correct", function () {
            cy.visit("/editor/person/8")

            cy.get("#person-id").should("have.value", 8)
            cy.get("#person-name").should("have.value", "Abu ’l-Wafāʾ Tuzun")
            cy.get("#person-short-name").should("have.value", "Tuzun")
            cy.get("#person-role .name-field").should("have.value", "cutter")
            cy.get("#person-role .data-select-id").should("have.value", 4)
            cy.get("#person-dynasty .name-field").should("have.value", "Būyide")
            cy.get("#person-dynasty .data-select-id").should("have.value", 1)
            cy.get("#person-color input[type=text]").should("have.value", "ff0000")
        })

    })


    describe("List Order", function () {
        it("List is in alphabetical order", function () {
            cy.visit("/editor/person")
            cy.get('.list-item .list-item-cell')
                .then($items => {
                    const arr = $items.map((_, html) => Cypress.$(html).text()).get()
                    return arr
                })
                .should('deep.eq', [
                    "Abu ’l-Ḥasan Muḥammad b. al-Mustakfī",
                    "Abu ’l-Wafāʾ Tuzun",
                    'ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad',
                    'al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir',
                    'al-Qādir bi-᾽llāh, Abu ᾽l-ʿAbbās Aḥmad b. Isḥāq',
                    'Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya',
                    'Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz',
                    'ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad'
                ])
        })
    })

    describe("Delete Person",
        function () {

            it("Delete",
                function () {
                    cy.visit("/editor/person")

                    cy.get(".list-item").contains('ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad').parents(".list-item").then($el => {
                        cy.triggerDeleteButton(".dynamic-delete-button", $el)
                    })

                    cy.get(".list-item").contains('Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 0, 255)")
                    cy.get(".list-item").contains('Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(0, 255, 255)")
                    cy.get(".list-item").contains('al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 0)")
                    cy.get(".list-item").contains("ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad").should("not.exist")
                })

            it("Still Deleted On Reload", function () {
                cy.visit("/editor/person")
                cy.get(".list-item").contains('Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 0, 255)")
                cy.get(".list-item").contains('Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(0, 255, 255)")
                cy.get(".list-item").contains('al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir').parents(".list-item").find(".color-indicator").should("have.css", "background-color", "rgb(255, 255, 0)")
                cy.get(".list-item").contains("ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad").should("not.exist")

            })
        })
})
