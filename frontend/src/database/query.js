import AxiosHelper from "../utils/AxiosHelper.js";
import Auth from "../utils/Auth";
import { graphqlEndpoint } from './host';
import { print } from 'graphql/language/printer';
import StringUtils from "../utils/StringUtils.js";

export default class Query {

    constructor(name) {
        this.name = name
    }

    get defaultProperties() {
        return [
            "id",
            "name"
        ]
    }

    get capitalizedName() {
        return StringUtils.capitalize(this.name)
    }

    async search(text, properties = this.defaultProperties) {
        const query = `
        {
            search${this.capitalizedName}(text: "${text}") {
                ${properties.join("\n")}
            }
    }`

        return this.raw(query)
    }

    async get(id, properties = this.defaultProperties) {

        const getName = `get${this.capitalizedName}`

        function recursivelyBuildBody(p) {
            for (let [index, object] of p.entries()) {
                if (typeof (object) == "object") {
                    if (Array.isArray(object)) throw new Error("Invalid property type: array")
                    let substring = ""
                    for (const key of Object.keys(object)) {
                        substring += key + " " + recursivelyBuildBody(object[key])
                    }
                    p[index] = substring
                }
            }
            return `{ ${p.join(",")} }`
        }

        const query = `
              {
                 ${getName}(id:${id})  
                    ${recursivelyBuildBody(properties)}
                
              }
            `

        const result = await Query.raw(query)
        return result.data.data[getName]
    }

    async raw(query, variables) {
        return Query.raw(query, variables)
    }

    async update(data) {

        if (data.id == -1) delete data.id

        let properties = ""
        for (let [key, val] of Object.entries(data)) {
            const fixedValue = typeof (val) == "string" ? `"${val}"` : Array.isArray(val) ? `[${val.join(",")}]` : val
            properties += key + ":" + fixedValue + ",\n"
        }
        properties = properties.slice(0, -2)

        const queryName = (data.id) ? "update" : "add"
        return this.raw(`mutation {
            ${queryName}${this.capitalizedName}(${properties})
          }
        `)
    }

    delete(id) {
        const query = `
        mutation {
          delete${this.capitalizedName}(
            id: ${id}
          )
        }
      `;

        return this.raw(query)
    }

    async list(properties) {
        const query = `{
          ${this.name} {
              ${properties.join(",")}
          }
        }
      `

        return Query.raw(query)
    }

    static async gql(query, variables) {
        const string = print(query)
        return this.raw(string, variables)
    }

    /**
     * The graphql upload is using this specification for GraphQL file uploads:
     * https://github.com/jaydenseric/graphql-multipart-request-spec
     * 
     * Found via: https://www.floriangaechter.com/posts/graphql-file-uploading/
     * 
     * @param {} identity 
     * @param {*} file 
     * @returns 
     */
    static async uploadFile(identity, file) {

        const formData = new FormData()
        const operations = `{
            "query": "mutation ($identity: String!, $file: Upload!) { uploadFile(identity: $identity, file: $file)}",
            "variables": {
                "file": null,
                "identity": "${identity}"
            }
        }`
        formData.append("operations", operations)

        const map = `{ "0": ["variables.file"]}`
        formData.append("map", map)
        formData.append("0", file)

        return AxiosHelper.request({
            url: graphqlEndpoint,
            method: "post",
            headers: Headers.join(Headers.ContentTypeFormData, Headers.Auth),
            data: formData
        })
    }



    static async raw(query, variables = {}, debug = false) {
        console.log(query, JSON.stringify(variables))

        if (debug)
            console.log(query, JSON.stringify(variables))
        return AxiosHelper.request({
            url: graphqlEndpoint,
            method: "post",
            headers: Headers.join(Headers.Auth),
            data: {
                query,
                variables
            },
        })
    }
}

export class Headers {

    static join(...args) {
        return Object.assign({}, ...args)
    }

    static get Auth() {
        return { "auth": Auth.loadToken() }
    }

    static get ContentTypeFormData() {
        return { "Content-Type": "multipart/form-data" }
    }
}