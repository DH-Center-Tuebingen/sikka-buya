const path = require("path")
const fs = require("fs")
const { createDirectoryStructure } = require('./utils/dir-builder')
const { finished } = require('stream/promises')
const Frontend = require('./frontend')


const supportedExtensions = ["png", "jpg", "jpeg", "pdf"]
class CMS {

    static get config() {
        return {
            data: {
                cms: {
                    images: true
                }
            }
        }
    }

    static init() {
        createDirectoryStructure(Frontend.publicPath, this.config)
    }

    static getPublicPath(...parts) {
        return path.join("/data", ...parts)
    }

    static get dataPath() {
        return path.join(Frontend.publicPath, "data")
    }

    /**
     * 
     * @param {array} parts - takes the path as array 
     */
    static getDataPath(...parts) {
        return path.join(this.dataPath, ...parts)
    }

    static async findFilesAt(parts, key, extensions = supportedExtensions) {
        const path = CMS.getDataPath(...parts)
        const files = await fs.promises.readdir(path)
        let regex = new RegExp(`^${key}.(${extensions.join("|")})$`, 'g')
        const matches = files.filter((fileName) => {
            return fileName.match(regex)
        })
        return matches
    }

    static async writeFileFromPromise(parts, filename, promise) {
        const fileStream = await promise.promise
        const ext = path.extname(fileStream.filename).toLowerCase()
        if (supportedExtensions.indexOf(ext.substring(1)) === -1) throw new Error("Unsupported file extension")
        const fileURI = this.getDataPath(...parts, filename + ext)

        const stream = fileStream.createReadStream()
        const writeStream = fs.createWriteStream(fileURI)
        stream.pipe(writeStream)
        await finished(writeStream)
        return fileURI
    }

    /**
     * 
     * @param {array} parts - path as array to directory
     * @param {string} filename - filename without extension
     * @param {array*} extensions - array of filenames (optional)  
     */
    static async removeExistingFiles(parts, filename, extensions = supportedExtensions) {
        const files = await this.findFilesAt(parts, filename, extensions)

        for (let file of files) {
            const absoluteFilePath = this.getDataPath(...parts, file)
            await fs.promises.unlink(absoluteFilePath)
        }

    }

    static get identityPathSeparator() {
        return "[$]"
    }

    static decomposeIdentity(identity) {
        const parts = identity.split(this.identityPathSeparator)
        const filename = parts.pop()
        return { parts, filename }
    }
}

module.exports = CMS