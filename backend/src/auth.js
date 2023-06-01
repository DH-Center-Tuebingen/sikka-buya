const bcrypt = require("bcrypt")
const { RegExValidationRule, FunctionValidationRule } = require("./validation")
const jwt = require("jsonwebtoken")
const { Database } = require("./utils/database")
const validator = require("email-validator")
const { User } = require('./models/user')

class Auth {
    static get saltIterations() {
        return 10
    }

    static async hashPassword(password) {
        return await bcrypt.hash(password, this.saltIterations)
    }

    static async checkPassword(password, hashedPW) {
        return await bcrypt.compare(password, hashedPW)
    }

    static validatePassword(str) {
        let rule = new RegExValidationRule(/^([\x21-\x7E]){6,}$/gi, "Ungültiges Password: Passwort muss mindestens 6 Zeichen lang sein und darf nur Buchstaben, Zeichen und gängige Sonderzeichen enthalten.")
        return rule.validate(str)
    }

    static validateEmail(str) {
        let rule = new FunctionValidationRule(validator.validate, "Ungültige Email-Adresse")
        return rule.validate(str)
    }

    /**
  * Login method checks the database for the hashed version of the password 
  * to authenticate the user.
  * 
  * @param {*} _ 
  * @param {{email:string, password:string}} args.data - Provide email and password for the login.
  * @returns {{success:boolean, message:string, token:string, user:object}} Returns an authentication object, that is send and stored at the client. 
  */
    static async login(_, args) {
        const { email, password } = args
        /* 
        We don't want to break out of the function, when we found no user, to
        not provide a potential attacker, with the information that the user does (not) exist!  
        */

        try {
            let user = await User.byMail(email)

            if (user && user.password) {
                let result = await Auth.checkPassword(password, user.password)
                delete user.password
                if (result) {
                    return {
                        success: true,
                        message: "Successfully authenticated.",
                        token: this.sign({
                            superUser: user.super,
                            id: user.id,
                            email: user.email,
                            permissions: user.permissions
                        }),
                        user
                    }
                }
            }
        } catch (e) {
            /*Wrong user was passed. Thats fine! */
            console.error(e)
        }


        return {
            success: false,
            message: "Die Angaben waren Falsch! Bitte überprüfen Sie ihren Nutzernamen und das Passwort.",
            token: null
        }
    }

    static sign({ id = null, email = null, superUser = null, permissions = [] } = {}) {
        return jwt.sign({
            id,
            email,
            super: superUser,
            permissions
        }, process.env.JWT_SECRET, {
            expiresIn: "12h"
        })

    }


    /**
     * Verifies a jwt token to authenticate the user. 
     * Does not throw an error when not authenticated.
     * 
     * If you need an error to be thrown, use {@link verifyContext} instead.
     * 
     * @param {object} token - JWT token, that was created and stored at the client by the servers {@link login}  
     * @returns {boolean} - True if valid, false otherwise.
     */
    static verify(token) {
        return jwt.verify(token, process.env.JWT_SECRET)
    }

    static getTokenFromContext(context) {
        let authHeader = context?.headers?.auth
        if (!authHeader || authHeader === "null") return null
        else return authHeader
    }

    /**
     * Verifies if the context contains a valid token.
     * Note: Will not throw an error on failure. Use {@link verifyContext} instead.
     * 
     * @param {*} context 
     * @returns - True if valid, false otherwise.
     */
    static authContext(context) {
        let valid = false
        let token = this.getTokenFromContext(context)
        if (token) {
            try {
                valid = this.verify(token)
            } catch (e) {
                valid = false
            }
        }
        return valid
    }


    /**
     * Verifies if the context contains a valid token.
     * Throws an error ("401") on failure.
     * 
     * @param {*} context
     * @returns - True if valid, false otherwise.
     * @throws - Throws an error "401" if the token is invalid.
     */
    static verifyContext(context) {
        let valid = this.authContext(context)
        if (!valid) throw new Error("401")
        return valid
    }

    static requireSuperUser(context) {
        const token = this.verifyContext(context)

        if (token) {
            if (token.super === true) {
                return true
            }
        }
        throw new Error(`Only a super user can do this!`)
    }

    static async requirePermission(context, name) {
        const { id, super: isSuperUser } = Auth.verifyContext(context)


        let allow = false
        if (id) {
            if (name === "super") {
                allow = Boolean(isSuperUser)
            } else {
                if (isSuperUser) return true
                const result = await Database.oneOrNone(`SELECT * FROM app_user_privilege WHERE app_user=$[id] AND privilege=$[name]`, { id, name })
                allow = Boolean(result)
            }
        }

        if (!allow)
            throw new Error(`Ihnen fehlt die Berechtigung: '${name}'`)

    }
}

module.exports = Auth