const { Database, WriteableDatabase } = require('../../utils/database')
const GQL = require('./gql')

class BlockGQL extends GQL {
    static maxDepth = 10;

    static async get(t, { id } = {}, depth = 0) {
        if (depth > this.maxDepth) {
            throw new Error("Block children depth exceeds the limit!")
        }

        let pageBlock = await t.one(`SELECT * FROM web_page_block WHERE id=$id`, id);
        const children = data.children
        let childBlocks = []
        children.forEach(child => {
            const childBlock = this.get(t, child, depth++)
            childBlocks.push(childBlock)
        });

        return pageBlock
    }

    static get Mutations() {
        return {
            async createBlock(_, { parent, block } = {}) {

                block = Object.assign({
                    type: "empty",
                    position: 9999999,
                    text: null,
                    image: null,
                    page: parent,
                    parent: null
                }, block)

                let { id } = await WriteableDatabase.one(`
                INSERT INTO web_page_block 
                (type, position, text, image, page, parent)
                VALUES
                ($[type], $[position], $[text], $[image], $[page], $[parent])
                RETURNING id
                `, block)

                return id

            },
            async updateBlock(_, { id, block } = {}) {
                if (!id) throw new Error("Id is required")

                await WriteableDatabase.none(`
                    UPDATE web_page_block SET
                    type=$[type], position=$[position], text=$[text], image=$[image]
                    WHERE id=$[id]
                `, Object.assign({ id }, block))
            },
            async deleteBlock(_, { id } = {}) {
                await WriteableDatabase.none(`
                DELETE FROM web_page_block
                WHERE id= $[id]
                `, { id })
            }
        }
    }

    static get Queries() {

    }
}
module.exports = BlockGQL;