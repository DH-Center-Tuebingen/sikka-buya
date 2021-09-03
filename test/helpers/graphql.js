const { default: axios } = require('axios');
const AxiosHelper = require('./axios');


function graphql(query, variables = {}, authToken = null) {
    console.log(query)

    headers = {}

    if (authToken) {
        headers.auth = authToken
    }

    return new Promise((resolve, reject) => {
        axios({
            url: "http://localhost:4000/graphql",
            method: "post",
            headers,
            data: {
                query,
                variables
            },
        }).then(result => {
            if (AxiosHelper.ok(result)) {
                resolve(result)
            } else {
                let errors = AxiosHelper.getErrors(result)
                reject(errors)
            }
        }).catch(reject)
    })
}


module.exports = { graphql }

