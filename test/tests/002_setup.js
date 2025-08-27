const chai = require('chai');
const expect = chai.expect
const fs = require("fs/promises")

const chaiPromise = require('chai-as-promised')
chai.use(chaiPromise)

const { graphql } = require('../helpers/graphql');
const path = require('path');
const { SuperUser, User } = require('../mockdata/users');
const pgPromise = require('pg-promise');



describe(`Setup test environment`, async function () {

    it(`Test if application is running properly`, async function () {
        let result = await graphql(`{
                ping
                }`)

        expect(result?.data?.data?.ping).to.not.be.undefined
    })

    it(`Setup the application with super user`, async function () {

        let result = await graphql(`mutation {
                setup(email: "${SuperUser.email}", password: "${SuperUser.password}") {
                  user {
                    id
                    email
                    super
                  }
                  token
                  success
                  message
                }
              }`)

        await fs.writeFile(path.join(__dirname, "..", "token.txt"), `This file is created by the setup function of the api test (npm run test:api).\nIf this you want to debug with this token and you receive a 401, you should update this token by running the respectice command:\n\n${result.data.data.setup.token}`)

        expect(result.data.data.setup).to.deep.include({
            success: true,
            message: null,
            user: {
                id: "1",
                email: SuperUser.email,
                super: true
            }
        })
    })

    it(`Additional setup results in an error`, async function () {

        const user = User
        let promise = graphql(`mutation {
                setup(email: "${user.email}", password: "${user.password}") {
                  user {
                    id
                    email
                    super
                  }
                  token
                  success
                  message
                }
              }`)

        await expect(promise).to.be.rejectedWith(['Superuser was already initialized!'])

    })
})