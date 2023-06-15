import Query from '../database/query';

export async function superUserIsSet() {
    // const result = await Query.raw(`{isSuperUserSet}`)
    // return result.data.data.isSuperUserSet
    return true
}