const maxDepth = 20

const { mkdirSync, existsSync } = require('fs')
const { join: joinPath } = require("path")

/**
 * Builds a folder structure from a provided config
 * object. 
 * 
 * 
 * @param {*} config 
 */
function createDirectoryStructure(basePath, config) {

    if (!existsSync(basePath)) {
        const error = "Base path does not exist"
        console.error(`${error}: ${basePath}`)
        throw new Error(error)
    }

    createChildDirectories(basePath, config)
}

function createChildDirectories(path, config, depth = 0) {
    try {
        for (let [key, children] of Object.entries(config)) {
            const targetPath = joinPath(path, key)
            if (!existsSync(targetPath)) {
                console.log("Create directory: " + targetPath)
                mkdirSync(targetPath)
            }
            if (children === true) {
                return targetPath
            } else {
                return createChildDirectories(targetPath, children, depth++)
            }
        }
    } catch (e) {
        console.error(e)
    }
}




module.exports = { createDirectoryStructure }