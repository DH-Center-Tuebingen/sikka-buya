const Argument = require('../argument')
const Auth = require('../auth')
const CMS = require('../cms')
const Language = require('../language')

// Utils
const { createDirectoryStructure } = require('../utils/dir-builder')
const { guardFunctionObject: guard } = require('../utils/guard.js')
const { WriteableDatabase, pgp, Database } = require('../utils/database.js')
const Type = require('../utils/type')

// Generic Klasses
const NamedGQL = require('./klasses/NamedGQL')
// Klasses
const BlockGQL = require('./klasses/BlockGQL')
const EpochGQL = new NamedGQL("epoch")
const MintRegionGQL = require('./klasses/MintRegionGQL')
const PageGQL = require('./klasses/PageGQL')
const SettingsGQL = require('./klasses/SettingsGQL')
const TreasureGQL = require('./klasses/TreasureGQL')

const Frontend = require('../frontend')
/**
 * Most mutations require the user to be logged in to
 * manipulate the database.
 * 
 * There are a few exceptions though, e.g.:
 * - InitialSetup of the super user
 * - Acception an invite to join as user
 * - ...
 */
const UnguardedMutations = {

    async acceptInvite(_, { email, password } = {}) {
        let pwValidator = Auth.validatePassword(password)
        if (pwValidator.failed) {
            throw new Error(pwValidator.error)
        }

        const hashedPW = await Auth.hashPassword(password)
        let result = await WriteableDatabase.oneOrNone("UPDATE app_user SET password = $[password] WHERE email=$[email] AND password IS NULL RETURNING id", { email, password: hashedPW })
        if (result == null) throw new Error("Could not set password!")
    },

    async setup(_, args) {
        let { case: result } = await WriteableDatabase.one(`SELECT CASE 
        WHEN EXISTS (SELECT * FROM app_user LIMIT 1) THEN 1
        ELSE 0 
      END`)

        if (result == 0) {

            const {
                email,
                password
            } = args

            let emailValidator = Auth.validateEmail(email)
            if (!emailValidator.ok) throw new Error(emailValidator.error)

            let passwordValidator = Auth.validatePassword(password)
            if (!passwordValidator.ok) throw new Error(passwordValidator.error)

            if (password && email) {
                const hashedPW = await Auth.hashPassword(password)
                let { id } = await WriteableDatabase.one("INSERT INTO app_user (email, password, super) VALUES ($[email], $[password], TRUE) RETURNING id", { email, password: hashedPW })


                let authResponse = {
                    success: true,
                    token: Auth.sign({ id, email, isSuper: true }),
                    message: null,
                    user: {
                        id,
                        email,
                        super: true
                    }
                }

                return authResponse
            } else {
                throw new Error("You must provide an email and a password!")
            }
        } else {
            throw new Error("Superuser was already initialized!")
        }
    }
}

const SuperUserMutations = {
    async deleteUser(_, args) {
        return WriteableDatabase.none("DELETE FROM app_user WHERE id=$[id]", args)
    },
    async inviteUser(_, { email } = {}) {
        let mailValidation = Auth.validateEmail(email)
        if (!mailValidation.ok) throw new Error(mailValidation.error)
        return await WriteableDatabase.none("INSERT INTO app_user (email) VALUES ($1)", email)
    },
    async grantPermission(_, { user, permission } = {}) {
        if (permission === "super")
            WriteableDatabase.none("UPDATE app_user SET super=TRUE WHERE id=$1", user)
        else
            WriteableDatabase.none("INSERT INTO app_user_privilege (app_user, privilege) VALUES ($[user], $[permission])", { user, permission })
    },
    async revokePermission(_, { user, permission } = {}, context) {
        if (permission === "super") {
            return WriteableDatabase.tx(async t => {
                const res = await t.manyOrNone("SELECT * FROM app_user WHERE super=TRUE")
                if (res.length == 1) throw new Error("You cannot revoke the super permission from the last super user!")
                await t.none("UPDATE app_user SET super=FALSE WHERE id=$1", user)
            })
        } else
            WriteableDatabase.none("DELETE FROM app_user_privilege WHERE app_user=$[user] AND privilege=$[permission]", { user, permission })
    },
    async setTypeComplete(_, {
        completed = true,
        id = null
    } = {}) {
        if (completed) {
            await WriteableDatabase.none("INSERT INTO type_completed (type) VALUES ($1) ON CONFLICT DO NOTHING", id)
        } else {
            await WriteableDatabase.none("DELETE FROM type_completed WHERE type=$1", id)
        }
        return completed
    },
    async setTypeReviewed(_, {
        reviewed = true,
        id = null,
    } = {}) {
        if (reviewed) {
            await WriteableDatabase.none("INSERT INTO type_reviewed (type) VALUES ($1) ON CONFLICT DO NOTHING", id)
        } else {
            await WriteableDatabase.none("DELETE FROM type_reviewed WHERE type=$1", id)
        }
        return reviewed
    }
}


const UserMutations = {
    async updateLang(_, args, context) {
        let { id,
            table,
            lang,
            attr,
            value } = args
        const langTable = `${table}_${lang}`

        if (langTables.indexOf(langTable) == -1) {
            throw new Error(`The table you want to enter a language attribute into is not whitelisted. Contact developer if you really want to update '${langTable}'.`)
        } else {
            let obj = {
                id
            }
            obj[attr] = value
            const query = pgp.helpers.insert(obj, null, langTable)
            await WriteableDatabase.none(query + " ON CONFLICT (id) DO UPDATE SET $[attr:name]=$[value]", { attr, value })
        }
    },

    async addComment(_, args) {
        let { text,
            user,
            property,
            propertyId: property_id } = args

        await WriteableDatabase.none("INSERT INTO comment (text, property, property_id, user_id) VALUES ($[text], $[property], $[property_id],$[user])", {
            text,
            property,
            property_id,
            user
        })
    },


    setLang(_, { path, lang, singular, plural } = {}) {
        Argument.require({ path, lang, singular })
        Language.set(path, lang, singular, plural)
    }
}

/**
 * Editors are users that have the 'editor' privilege set.
 * 
 * 
 * Generally any priovilege (just a string) can be stored in the 'app_user_privilege' table 
 * and be used to guard specific routes like it's done with the editor mutations.
 */
const EditorMutations = {
    ...TreasureGQL.Mutations,
    ...MintRegionGQL.Mutations,
    ...EpochGQL.Mutations,
    async changePersonExplorerOrder(_, args) {
        return WriteableDatabase.none("INSERT INTO person_explorer_custom_sorting (person, position) VALUES ($[person], $[position]) ON CONFLICT (person) DO UPDATE SET position=$[position]", args)
    },
    async updateCoinType(_, args, context) {
        if (!args.id) throw new Error("No id provided!")

        return Type.updateType(args.id, args.data, context)
    },
    async updateNote(_, args) {
        let { text, property, propertyId: property_id } = args
        await WriteableDatabase.none(`
            INSERT INTO note (text, property, property_id) 
            VALUES ($[text], $[property], $[property_id])
            ON CONFLICT (property, property_id)
            DO UPDATE SET text=$[text]
            WHERE note.property=$[property] AND note.property_id=$[property_id];
            `, { text, property, property_id })
    },
    async addCoinType(_, args, context, info) {
        return Type.addType(_, args, context, info)
    },
    async deleteCoinType(_, args, context, info) {
        const { super: isSuperUser } = Auth.verifyContext(context)

        if (!isSuperUser) {
            const { completed, reviewed } = await WriteableDatabase.oneOrNone(`
        SELECT 
            CASE WHEN type_completed.type is null
            then False
            else True 
            END as completed,

            CASE WHEN type_reviewed.type is null
            then False
            else True
            END as reviewed
        FROM type 
        LEFT JOIN type_completed ON type_completed.type = type.id
        LEFT JOIN type_reviewed ON type_reviewed.type = type.id
        WHERE id=$[id]
        `, { id })

            if (completed || reviewed) {

                throw new Error("error.type.delete.only_super_can_delete_completed_or_reviewed_types")
            }
        }

        return Type.deleteType(args.id)
    },
    async updateMaterialColor(_, args) {
        return WriteableDatabase.none(`INSERT INTO material_color (material, color) VALUES ($[id], $[color]) ON CONFLICT (material) DO UPDATE SET color=$[color]`, args)
    },
}

const WriterMutations = {
    ...PageGQL.Mutations,
    ...BlockGQL.Mutations,
    async uploadFile(_, { identity, file: filePromise }) {
        if (!identity) throw new Error("Identity field is required!")
        if (!filePromise) throw new Error("File field is required!")

        const { parts, filename } = CMS.decomposeIdentity(identity)

        const dirConfig = {}
        let obj = dirConfig
        for (let [index, part] of parts.entries()) {
            obj[part] = (index == parts.length - 1) ? true : {}
            obj = obj[part]
        }

        createDirectoryStructure(CMS.dataPath, dirConfig)
        await CMS.removeExistingFiles(parts, filename)
        try {
            const fileURI = await CMS.writeFileFromPromise(parts, filename, filePromise)
            console.log("File was uploaded to: " + fileURI)
        } catch (e) {
            console.error("ERROR OCCURED: ", e)
        }
    },
    async deleteFile(_, { identity }) {
        if (!identity) throw new Error("Identity field is required!")

        const { parts, filename } = CMS.decomposeIdentity(identity)
        await CMS.removeExistingFiles(parts, filename)
    },
}

const Mutations = Object.assign({},
    UnguardedMutations,
    guard(UserMutations, (_, __, context) => {
        return Auth.verifyContext(context)
    }),
    guard(WriterMutations, async (_, __, context) => await Auth.requirePermission(context, 'writer')),
    guard(EditorMutations, async (_, __, context) => await Auth.requirePermission(context, 'editor')),
    guard(Object.assign(
        SuperUserMutations,
        SettingsGQL.Mutations,
    ), (_, __, context) => Auth.requireSuperUser(context)
    ),
)

module.exports = Mutations