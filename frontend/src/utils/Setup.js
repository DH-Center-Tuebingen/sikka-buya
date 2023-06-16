import Query from '../database/query';

export async function superUserIsSet() {
    let isSet = false
    try {
        const result = await Query.raw(`{isSuperUserSet}`)
        isSet = result?.data.data?.isSuperUserSet || false
    } catch (err) {
        console.log(err)
    }
    return isSet
}