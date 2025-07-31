
const { Database, WriteableDatabase } = require('../utils/database')

class CoinType {

  static async add(args, context, info) {
    return Type.addType(args, context, info)
  }

  static async delete(args, context, info) {
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
  }

  static async update(args, context) {
    if (!args.id) throw new Error("No id provided!")

    return Type.updateType(args.id, args.data, context)
  }

  static async setComplete({
    completed = true,
    id = null
  } = {}) {
    console.log(`Setting type ${id} completed to ${completed}`)
    if (completed) {
      await WriteableDatabase.none("INSERT INTO type_completed (type) VALUES ($1) ON CONFLICT DO NOTHING", id)
    } else {
      await WriteableDatabase.none("DELETE FROM type_completed WHERE type=$1", id)
    }
    return completed
  }

  static async setReviewed({
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

module.exports = CoinType