/**
 * If the database is updated and the permissions for the read-only user
 * are not valid anymore. Just run this script to update all the read-only
 * users permissions to the updated database.
 */

const { grantPermissionsToReadOnlyUser } = require('./create_read_only_user')
const { error, notice } = require('./modules/logging')

async function main() {
    await grantPermissionsToReadOnlyUser()
    return "Applied permissions successfully!"
}

main().then(notice).catch(error)