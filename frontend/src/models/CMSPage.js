import Query from "../database/query"

export default class CMSPage {

    constructor() {
        this.id = null
        this.title = null
        this.subtitle = null
        this.summary = null
        this.body = null
        this.image = null
        this.createdTimestamp = null
        this.publishedTimestamp = null
        this.modifiedTimestamp = null
    }

    assign(page) {
        if (page) {
            this.id = page.id
            this.title = page.title
            this.subtitle = page.subtitle
            this.summary = page.summary
            this.body = page.body
            this.image = page.image
            this.createdTimestamp = page.createdTimestamp
            this.publishedTimestamp = page.publishedTimestamp
            this.modifiedTimestamp = page.modifiedTimestamp
        }
    }


    static async delete(id) {
        await Query.raw(`mutation DeleteCMSPage($id:ID!){
            deletePage(id: $id)
        }`, { id })
    }

    static async create(pageGroup) {
        const result = await Query.raw(`mutation CreateCMSPage($pageGroup:String!){
            createPage(title: "", group: $pageGroup)
        }`, { pageGroup })

        return result.data.data.createPage
    }

    static async update(id, page) {
        let pageObject = Object.assign({
            id: null,
            title: null,
            subtitle: null,
            summary: null,
            body: null,
            image: null,
            createdTimestamp: null,
            modifiedTimestamp: null,
        }, page)

        this.timestampsToStrings(pageObject)

        await Query.raw(`mutation UpdatePage($id:ID!, $page: PageInput){
            updatePage(id: $id,page: $page)
        }`, { id, page: pageObject }
        )
    }

    static async list(group) {
        const result = await Query.raw(`
        query GetPageList($group: String!){
            getPageList(group: $group)
            {
                id
                subtitle
                title 
                body
                createdTimestamp
                modifiedTimestamp
                publishedTimestamp
                blocks {
                    id
                    type
                    position
                    text
                    image
                }
            }
        }`, { group })
        const list = result.data.data.getPageList
        list.forEach(page => this.timestampsToNumbers(page))
        return list
    }

    static async getSingle(group) {
        const result = await Query.raw(`{
            getSinglePage(group: "${group}"){
            id
            subtitle
            title
            body
            createdTimestamp
            modifiedTimestamp
            publishedTimestamp
            blocks {
                id
                type
                position
                text
                image
            }
          }
        }`
            , {})
        const page = result.data.data.getSinglePage
        this.timestampsToNumbers(page)
        return page
    }

    static async get(id) {
        const result = await Query.raw(`{
            getPage(id: ${id}){
            id
            subtitle
            title
            body
            createdTimestamp
            modifiedTimestamp
            publishedTimestamp
            blocks {
                id
                type
                position
                text
                image
            }
          }
        }`
        )
        const page = result.data.data.getPage
        this.timestampsToNumbers(page)
        return page
    }


    static async timestampsToNumbers(page) {
        page.createdTimestamp = parseInt(page.createdTimestamp)
        page.modifiedTimestamp = parseInt(page.modifiedTimestamp)
        page.publishedTimestamp = parseInt(page.publishedTimestamp)
        return page
    }

    static async timestampsToStrings(page) {
        page.createdTimestamp = page.createdTimestamp ? page.createdTimestamp.toString() : null
        page.modifiedTimestamp = page.modifiedTimestamp ? page.modifiedTimestamp.toString() : null
        page.publishedTimestamp = page.publishedTimestamp ? page.publishedTimestamp.toString() : null
        return page
    }
}