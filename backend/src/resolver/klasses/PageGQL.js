const Auth = require('../../auth')
const Argument = require('../../argument')
const { Database, WriteableDatabase } = require('../../utils/database')
const GQL = require('./gql')


/*
    Converts a result from the database to a GraphQL object
*/
function entryToGraphQL(entry) {
    let obj = {}
    obj.id = entry.id
    obj.title = entry.title
    obj.subtitle = entry.subtitle
    obj.summary = entry.summary
    obj.body = entry.body
    obj.image = entry.image
    obj.createdTimestamp = entry.created_timestamp
    obj.publishedTimestamp = entry.published_timestamp
    obj.modifiedTimestamp = entry.modified_timestamp
    return obj
}

/*
    Converts an array of results from the database to an array of GraphQL objects
*/
function resultsToGraphQLPage(arr) {
    return arr.map(res => entryToGraphQL(res))
}

/*
    PageGQL is a GraphQL resolver for the Page model
*/
class PageGQL extends GQL {
    static get Mutations() {
        return {
            createPageGroup: async function (_, { name } = {}) {
                if (!name || name == "") throw new Error("Name is required!")
                const { id } = await WriteableDatabase.one(`INSERT INTO web_page_group (name) VALUES ($[name]) RETURNING id`, { name })
                return id
            },
            createPage: async function (_, { title = "", group } = {}) {

                let returnedValue = await WriteableDatabase.oneOrNone("SELECT id FROM web_page_group WHERE name=$1 LIMIT 1", group)
                if (returnedValue == null)
                    returnedValue = await WriteableDatabase.one("INSERT INTO web_page_group (name) VALUES ($1) RETURNING id", group)

                const groupId = returnedValue.id

                let pageResult
                try {
                    pageResult = await WriteableDatabase.one(`
                INSERT INTO web_page 
                (title, page_group, created_timestamp, modified_timestamp) 
                VALUES 
                ($[title], $[groupId], NOW(), NOW()) 
                RETURNING id`, { title, groupId })
                } catch (e) {
                    console.error(e)
                }

                return pageResult.id || null
            },
            deletePage: async function (_, { id } = {}) {
                Argument.require({ id })
                await WriteableDatabase.none(`DELETE FROM web_page WHERE id=$[id]`, { id })
            },
            updatePage: async function (_, { id, page: pageInput } = args = {}) {
                Argument.require({ id })

                delete pageInput.id
                let values = Object.assign({
                    id: id,
                    title: null,
                    subtitle: null,
                    summary: null,
                    body: null,
                    image: null,
                    publishedTimestamp: null
                }, pageInput)

                values.publishedTimestamp = values.publishedTimestamp / 1000


                await WriteableDatabase.none(`UPDATE web_page SET 
                    title= $[title],
                    subtitle= $[subtitle],
                    summary= $[summary],
                    body= $[body],
                    image= $[image],
                    published_timestamp= to_timestamp($[publishedTimestamp]),
                    modified_timestamp= NOW()
                    WHERE id= $[id]`
                    , values)

            }
        }
    }

    static get Queries() {
        return {
            getPageGroup: async function (_, { name } = {}, context) {
                if (Auth.verifyContext(context)) {
                    const result = await Database.oneOrNone(`SELECT * FROM web_page_group WHERE name=$[name]`, { name })
                    return result?.id || null
                }
                return null
            },
            getPage: async function (_, { id } = {}) {
                Argument.require({ id })

                let page = {}

                await Database.tx(async t => {

                    let results = await t.manyOrNone(`
                    SELECT *   FROM web_page 
                    LEFT JOIN web_page_group ON web_page_group.id = web_page.page_group
                    WHERE web_page.id = $[id]
                    LIMIT 1
                    `, { id });

                    let childBlocks = await t.manyOrNone(`
                    SELECT * FROM web_page_block WHERE page=$[id] ORDER BY position
                    `, { id })



                    page = resultsToGraphQLPage(results)[0]
                    page.blocks = childBlocks
                })

                return page
            },
            getSinglePage: async function (_, { group } = {}) {

                const result = await Database.oneOrNone(`SELECT web_page.* FROM web_page 
                LEFT JOIN web_page_group ON web_page_group.id = web_page.page_group
                WHERE web_page_group.name = $1
                LIMIT 1`, group)

                return result ? entryToGraphQL(result) : null
            },
            getPageList: async function (_, { group } = args = {}, context) {
                Argument.require({ group })

                const auth = Auth.authContext(context)

                const where = auth ? "" : "AND published_timestamp > timestamp '1971-01-01 00:00:00' AND published_timestamp <= now()"
                const orderBY = auth ? "created_timestamp DESC" : "published_timestamp DESC"

                let results = []
                try {

                    //TODO: Should be ordered by published_timestamp
                    // but publishing is not yet implemented,
                    results = await Database.manyOrNone(`
                    SELECT web_page.* FROM web_page 
                    LEFT JOIN web_page_group ON web_page_group.id = web_page.page_group
                    WHERE web_page_group.name = $1 ${where}
                    ORDER BY ${orderBY};
                `, group)
                } catch (e) {
                    console.error(e)
                }

                return resultsToGraphQLPage(results)
            }
        }
    }
}

module.exports = PageGQL