const { warn } = require("../../backend/scripts/modules/logging.js")
const { graphql } = require('./graphql.js')

class TestUser {

    constructor(email, password, permissions = []) {
        this.id = null
        this.token = null
        this.email = email
        this.password = password

        this.superUser = permissions.includes("super")
        if (this.superUser) {
            permissions = permissions.filter(p => p !== "super")
        }
        this.permissions = permissions
    }

    get super() {
        return this.superUser
    }

    isLoggedIn() {
        return this.token != null
    }

    authenticate(token) {
        this.token = token
    }

    async setup() {
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
            }`, {
            email: this.email,
            password: this.password
        })
    }

    async setupPermissions(granter = this, permissions = []) {

        if(!this.id){
            throw new Error("User ID is required")
        }

        this.permissions = [...new Set([...this.permissions, ...permissions])]
        if(this.permissions.length === 0) return

        const permissionString = this.permissions.reduce((acc, permission) => {
            return acc + `grantPermission(user:${this.id}, permission:"${permission}")`
        }, '')

        return graphql(`mutation GrantPermissions {
            ${permissionString}
        }`, {}, granter?.token)
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