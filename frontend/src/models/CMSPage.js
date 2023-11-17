import Query from "../database/query"

export default class CMSPage {

    constructor({
        id = null,
        title = null,
        subtitle = null,
        summary = null,
        body = null,
        image = null,
        createdTimestamp = null,
        publishedTimestamp = null,
        modifiedTimestamp = null,
    } = {}) {
        this.id = id
        this.title = title
        this.subtitle = subtitle
        this.summary = summary
        this.body = body
        this.image = image
        this.createdTimestamp = createdTimestamp
        this.publishedTimestamp = publishedTimestamp
        this.modifiedTimestamp = modifiedTimestamp
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

    static async upsert(group, id, page) {
        if (id) {
            await this.update(id, page)
        } else {
            id = await this.create(group)
            await this.update(id, page)
        }
        return id
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

        const singlePage = result.data.data.getSinglePage || {}
        const page = new CMSPage(singlePage)
        return this.postprocessPage(page)
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
        return this.postprocessPage(page)
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

    static async postprocessPage(page) {

        if (page) {
            this.timestampsToNumbers(page)
        }
        return page
    }

}