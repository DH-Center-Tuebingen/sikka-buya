import axios from 'axios'

export default class AxiosHelper {

    static timeout(callback) {
        return setTimeout(() => {
            callback('Operation timed out.')
        }, 15000)
    }

    static request(config) {
        return new Promise((resolve, reject) => {
            const timeout = this.timeout(reject)
            axios(config).then(result => {
                AxiosHelper.catchUnrejectedErrors(result, resolve, reject)
            }).catch((e) => {
                AxiosHelper.handleRejectedErrors(e, reject)
            }).finally(() => clearTimeout(timeout))
        })
    }

    static handleRejectedErrors(error, reject) {
        if (error.isAxiosError) {
            if (error.response) {
                reject(error.response.data.errors.map(item => item.message).join(" --- "))
            } else {
                reject("Server ist derzeit nicht erreichbar. Versuchen Sie es später nochmal.")
            }
        } else reject(error)
    }

    static catchUnrejectedErrors(result, resolve, reject) {
        if (AxiosHelper.ok(result)) {
            resolve(result)
        } else {
            let errors = AxiosHelper.getErrors(result)
            reject(errors)
        }
    }

    static ok(result) {
        if (result.data.errors && result.data.errors.length > 0) {
            return false
        } else return true
    }

    static getErrors(result) {
        let errors = [];
        if (result.data.errors && result.data.errors.length > 0) {
            errors = result.data.errors.map(errObj => errObj.message)
        }
        return errors
    }
}