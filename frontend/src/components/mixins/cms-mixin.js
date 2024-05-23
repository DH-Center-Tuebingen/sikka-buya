import CMSPage from '../../models/CMSPage'

/**
 * This module exports a mixin object that provides methods to interact with CMS pages.
 * 
 * @module cms-mixin
 * @typedef {Object} CMSMixin
 * @property {Function} cms_mixin_delete - A method that deletes a CMS page with the given ID.
 * @property {Function} cms_mixin_edit - A method that navigates to the page editor for the CMS page with the given ID.
 * @property {Function} cms_mixin_createPage - A method that creates a new CMS page with the given group name.
 * @property {Function} cms_mixin_createAndVisit - A method that creates a new CMS page with the given group name and navigates to its editor.
 * @property {Function} cms_mixin_list - A method that lists all CMS pages in the given group.
 * @property {Function} cms_mixin_get - A method that retrieves the CMS page with the given ID and group.
 */

export default {
    data() {
        return {
            exists: true,
            loaded: false
        }
    },
    methods: {
        cms_mixin_getPublishedState(timestamp) {
            timestamp = parseInt(timestamp)
            if (isNaN(timestamp) || timestamp <= 0) return "draft"
            else return (timestamp > Date.now()) ? "scheduled" : "published"
        },
        cms_mixin_delete: async function (id) {
            if (id)
                await CMSPage.delete(id)
        },
        cms_mixin_edit: function ({ id, group = "Unknown Group" } = {}, additionalParams = {}) {
            if (id)
                this.$router.push({ name: 'CMSEditPage', params: Object.assign({}, { group, id }, additionalParams) })
        },
        cms_mixin_createPage: async function (pageGroupName) {
            return CMSPage.create(pageGroupName)
        },
        cms_mixin_createAndVisit: async function (pageGroupName, props) {
            const id = await CMSPage.create(pageGroupName)
            if (id)
                this.$router.push({ name: "CMSEditPage", props, params: { id, group: pageGroupName } })
        },
        cms_mixin_list: async function (group) {
            return CMSPage.list(group)
        },
        cms_mixin_get: async function ({ id, group }) {
            let page = null
            this.$data.loaded = false

            if (!id && !group) throw new Error("Id or group must be provided")
            else if (!id) {
                // get the first page of the group
                page = await CMSPage.getSingle(group)
            } else {
                // get the page with the id
                page = CMSPage.get(id)
            }

            this.$data.loaded = false
            if (page?.id == null) {
                this.$data.exists = false
            } else {
                this.$data.exists = true
            }

            return page
        }
    }
}