const Settings = require('../../models/settings.js')
const GQL = require('./gql.js')

class SettingsGQL extends GQL {
    static get Mutations() {
        return {
            updateSetting: (_, args) => Settings.update(args.path, args.value),
            deleteSetting: (_, args) => Settings.delete(args.path),
        }
    }

    static get Queries() {
        return {
            getSetting: (_, args) => Settings.get(args.path),
            settings: (_, args, context, info) => Settings.list(_, args, context, info),
        }
    }
}

module.exports = SettingsGQL