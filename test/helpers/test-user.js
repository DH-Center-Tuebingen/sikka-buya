const { warn } = require("../../backend/scripts/modules/logging.js")
const { graphql } = require('./graphql.js')

class TestUser {

    constructor(email, password, superUser = false, permissions = []) {
        this.id = null
        this.token = null
        this.email = email
        this.password = password
        this.superUser = superUser
        this.permissions = permissions
    }

    isLoggedIn() {
        return this.token != null
    }

    authenticate(token) {
        this.token = token
    }

    async setup() {
        const permissionString = this.permissions.reduce((acc, permission) => {
            return acc + `grantPermission(user:1, permission:"${permission}")`
        }, '')

        return graphql(`mutation setup($email:String!, $password:String!){
            setup(email: $email, password: $password) {
              user {
                id
                email
                super
              }
              token
              success
              message
            }
            ${permissionString}
          }`, {
            email: this.email,
            password: this.password
        })

    }

    async login() {
        let response = await TestUser.login(this.email, this.password)
        if (response?.data?.data?.login?.success) {
            let data = response?.data?.data?.login
            this.token = data.token
            let { id, super: superUser } = data.user
            this.superUser = superUser
            this.id = id
        } else warn(`Could not login test user ${this.email}!`, response?.data?.data?.login)
        return response
    }

    async invite(email) {
        if (!this.superUser) throw new Error(`Only super users can invite other users!`)
        return await graphql(`mutation Invite($email:String!){
            inviteUser(email:$email)
          }`, { email }, this.token)
    }

    async acceptInvite() {
        return await graphql(`mutation AcceptInvite($email:String!, $password:String!){
            acceptInvite(email:$email, password:$password)
          }`, { email: this.email, password: this.password })
    }


    static async login(email, password, debug = false) {
        return await graphql(`query Login($email: String!, $password:String!){ login(
            email: $email,
            password: $password
          ){
              success
              message
              token
              user {
                  id
                  email
                  super
              }
            }
          }`, { email, password }, null, debug)
    }
}

module.exports = TestUser