
const { GeoJSON } = require('./src/models/geojson.js')
const Mutation = require('./src/resolver/mutations.js')
const Query = require('./src/resolver/queries.js')
const fs = require("fs")

const CMS = require('./src/cms.js')
const Frontend = require('./src/frontend.js')
const Language = require('./src/language.js')
const { createSchema } = require('graphql-yoga')

async function start({
    expressPort,
    routes = []
} = {}) {


    const { default: graphqlUploadExpress } = await import("graphql-upload/graphqlUploadExpress.mjs");
    Frontend.init()
    Language.init()
    /**
     * Express packages
     */
    const express = require("express")
    const cors = require("cors")
    const path = require("path")


    /**
     * GraphQL Imports
     */
    const { graphqlHTTP } = require("express-graphql")
    const { loadFiles } = require('@graphql-tools/load-files')

    /**
     * Custom GraphQL Extensions
     */
    const Resolver = require("./src/resolver.js")
    const MintResolver = require("./src/resolver/mintresolver.js");
    const PersonResolver = require("./src/resolver/personresolver.js");
    const MaterialResolver = require("./src/resolver/materialresolver.js");

    CMS.init()

    return new Promise(async resolve => {
        const app = express()

        /**
         * Enables more traffic to the server.
         */
        app.use(express.json({ limit: '10mb' }))
        app.use(express.urlencoded({ extended: true, limit: '10mb' }))

        /**
         * The cors middleware allows (currently) all cross-domain calls.
         */
        app.use(cors(["http://localhost", "https://localhost", "127.0.0.1"]))

        /**
         * The Resolver class combines the basic operations of
         * get, add, delete, update and list in one convenient utility.
         */
        const resolverClasses = [
            new Resolver("coinMark", { tableName: "coin_marks" }),
            new Resolver("coinVerse", { tableName: "coin_verse" }),
            new MaterialResolver(),
            new MintResolver(),
            new Resolver("title"),
            new PersonResolver(),
            new Resolver("honorific"),
            new Resolver("nominal"),
            new Resolver("dynasty"),
            new Resolver("role", { tableName: "person_role" }),
            new Resolver("province")
        ]

        const langTables = ['material_en']


        /**
         *  Here custom resolvers are added to the object.
         */
        const resolvers = {
            Query, Mutation
        }




        /**
         * The schema file describes the requests a user can query 
         * to the graphql interface. 
         */

        resolverClasses.forEach((resolverClass) => {
            Object.assign(resolvers.Query, resolverClass.resolvers.Query)
            Object.assign(resolvers.Mutation, resolverClass.resolvers.Mutation)
        })

        let geoJSONScalar = GeoJSON.scalarType

        const typeDefs = await loadFiles(path.join(__dirname, "./src/graphql/schema.graphql"))

        const schema = createSchema({
            typeDefs,
            resolvers: {
                GeoJSON: geoJSONScalar,
                Query: Object.assign({}, resolvers.Query),
                Mutation: Object.assign({}, resolvers.Mutation),
            }
        })

        /**
         * Route of the GraphQL endpoint.
         */
        app.use('/graphql',
            graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
            graphqlHTTP({
                schema,
                graphiql: true
            }))

        for (let route of routes) {
            const method = route.method || "all"
            app[method](route.route, route.handler)
        }

        app.use("/", (req, res, next) => {
            res.send("Welcome")
        })



        const instance = app.listen(expressPort, () => {
            console.log(`Express GraphQL Server Is Running On http://localhost:${expressPort}/graphql`)
            resolve({ app, instance })
        })
    })
}

module.exports = start