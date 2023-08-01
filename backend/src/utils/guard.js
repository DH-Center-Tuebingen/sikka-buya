function guardFunctionObject(obj, guardingFunction) {
    return Object.entries(obj).reduce((prev, [name, func]) => {
        prev[name] = guard(func, guardingFunction)
        return prev
    }, {})
}

function guard(func, guardingFunction) {
    return async function () {
        await guardingFunction(...arguments)
        return await func(...arguments)
    }
}


module.exports = {
    guard,
    guardFunctionObject
}