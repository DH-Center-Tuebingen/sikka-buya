const path = require("path")
const fs = require("fs")
const { sep } = require('path')

class Frontend {

    static _publicPath = null

    static init() {
        if (this._publicPath) throw Error("Public path was already set!")
        else {
            if (process.env.FRONTEND_PUBLIC_LOCATION) {
                this._publicPath = process.env.FRONTEND_PUBLIC_LOCATION
            } else if (process.env.RELATIVE_FRONTEND_PUBLIC_LOCATION) {
                process.env.FRONTEND_PUBLIC_LOCATION = path.join(__dirname, "..", process.env.RELATIVE_FRONTEND_PUBLIC_LOCATION)
                this._publicPath = process.env.FRONTEND_PUBLIC_LOCATION
            } else {
                throw new Error("Frontend location not set in .env file. Please set either RELATIVE_FRONTEND_PUBLIC_LOCATION or FRONTEND_PUBLIC_LOCATION")
            }

            if (!fs.existsSync(process.env.FRONTEND_PUBLIC_LOCATION)) {
                throw new Error("Frontend location is invalid this path does not exist: " + process.env.FRONTEND_PUBLIC_LOCATION)
            }
        }
        console.log(`Frontend initialized: ${this._publicPath}`)
    }

    static get publicPath() {
        if (!this._publicPath) throw new Error("Public path has not been initialized yet!")
        return this._publicPath
    }

    static getByParts(...parts) {
        return path.join(this.publicPath, ...parts)

    }

    static createByParts(...parts) {
        const filePath = this.getByParts(...parts)
        fs.mkdirSync(filePath, { recursive: true })
        return filePath
    }

    static createByPath(...path) {
        let parts = path.split(sep)
        return this.createByParts(...parts)
    }
}

module.exports = Frontend