function required(value) {
    return Boolean(value)
}

function arrayRequired(value) {
    return required(value) && Array.isArray(value)
}

function messageFromValidator(func, key, value) {
    const requiredError = `Missing required option "${key}": ${value}`
    switch (func.name) {
        case "required":
            return requiredError
        case "arrayRequired":
            return (Array.isArray(key)) ? requiredError : `Argument "${key}" must be an array: ${value}`
        default:
            return `Unkown validator error for "${func.name}" on key "${key}" with value "${value}"`
    }
}

module.exports = {
    arrayRequired,
    messageFromValidator,
    required,
} 