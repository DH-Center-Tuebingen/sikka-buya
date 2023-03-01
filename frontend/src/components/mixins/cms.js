import CMSPage from '../../models/CMSPage'

/**
 * Helps handling CMS functionality
 */
export default {
    methods: {
        cms_delete: async function (id) {
            if (id)
                await CMSPage.delete(id)
        },
        cms_edit: function ({ id, group, props } = {} ) {
            return { name: 'CMSPage', params: { group, id }, props }
        },
        cms_createPage: async function (pageGroupName) {
            return CMSPage.create(pageGroupName)
        },
        cms_createAndVisit: async function (pageGroupName, props) {
            const id = await CMSPage.create(pageGroupName)
            if (id)
                this.$router.push({ name: "CMSPage", props, params: { id, group: pageGroupName } })
        },
        cms_list: async function (group) {
            return CMSPage.list(group)
        }
    }
}