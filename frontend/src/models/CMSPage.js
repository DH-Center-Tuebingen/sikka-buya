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
        return result.data.data.getPageList
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
        return result.data.data.getSinglePage
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
        return result.data.data.getPage
    }

}