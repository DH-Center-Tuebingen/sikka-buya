const { Chalk } = require("chalk")

const chalk = new Chalk()

function log(msg, ...optional_parameters) {
    console.log(msg, ...optional_parameters)
}

function warn(msg, ...optional_parameters) {
    console.warn(chalk.bold.yellow(msg), ...optional_parameters)
}

function error(msg, ...optional_parameters) {
    console.error(chalk.bold.red(msg), ...optional_parameters)
}

function success(msg, ...optional_parameters) {
    log(chalk.bold.green(msg), ...optional_parameters)
}

function notice(msg, ...optional_parameters) {
    log(chalk.bold.blue(msg), ...optional_parameters)
}



module.exports = {
    error,
    warn,
    log,
    notice,
    success
}