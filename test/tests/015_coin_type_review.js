const chai = require('chai')
const expect = chai.expect
const { graphql } = require("../helpers/graphql");
const { SuperUser, User3 } = require('../mockdata/users');
const { default: gql } = require('graphql-tag');
const { print } = require('graphql/language/printer');

const MOD_GET_TYPES_QUERY = print(gql`query { 
    modGetTypes { types { id, projectId, reviewed, completed } } 
}`)

const SET_TYPE_COMPLETE_MUTATION = print(gql`
  mutation SetTypeComplete($id: ID!, $value: Boolean!) {
    setTypeComplete(id: $id, completed: $value)
  }
`);

const SET_TYPE_REVIEWED_MUTATION = print(gql`
  mutation SetTypeReviewed($id: ID!, $value: Boolean!) {
    setTypeReviewed(id: $id, reviewed: $value)
  }
`);

describe('Type verification', function () {

    describe('Authentication', function () {
        it('Cannot get list if not logged in', async function () {
            const promise = graphql(MOD_GET_TYPES_QUERY)
            await expect(promise).to.be.rejectedWith(['401'])
        })

        it('Can get list if not logged in', async function () {
            const promise = graphql(MOD_GET_TYPES_QUERY, {}, SuperUser.token)
            await expect(promise).to.be.fulfilled
        })
    })

    describe('List correct order', function () {

        it('Items are in correct order', async function () {
            const result = await graphql(MOD_GET_TYPES_QUERY, {}, SuperUser.token)
            expect(result.data.data.modGetTypes.types[0].id).to.equal("2")
            expect(result.data.data.modGetTypes.types[1].id).to.equal("1")
        })

    })

    describe('Read', function () {

        it('Completed statements are correct', async function () {
            const result = await graphql(MOD_GET_TYPES_QUERY, {}, SuperUser.token)

            expect(result.data.data.modGetTypes.types[1].completed).to.be.true
            expect(result.data.data.modGetTypes.types[0].completed).to.be.false
        })

        it('Reviewed statements are correct', async function () {
            const result = await graphql(MOD_GET_TYPES_QUERY, {}, SuperUser.token)

            expect(result.data.data.modGetTypes.types[0].reviewed).to.be.true
            expect(result.data.data.modGetTypes.types[1].reviewed).to.be.false
        })
    })

    describe('Completed', function () {

        describe('Activate', function () {

            it('Cannot activate completed when not logged in', async function () {
                const promise = graphql(SET_TYPE_COMPLETE_MUTATION, { id: 2, value: true })
                return expect(promise).to.be.rejectedWith(['401'])
            })

            it('Cannot activate completed when not logged in as super user', async function () {
                const promise = graphql(SET_TYPE_COMPLETE_MUTATION, { id: 2, value: true }, User3.token)
                return expect(promise).to.be.rejectedWith(['401'])
            })
            it('Can activate completed when super user', async function () {
                    const result = await graphql(SET_TYPE_COMPLETE_MUTATION, { id: 2, value: true }, SuperUser.token)
                    const success = result.data.data.setTypeComplete
                    return expect(success).to.be.true
            })

            it('After activation completed list is correct', async function () {
                const result = await graphql(MOD_GET_TYPES_QUERY, {}, SuperUser.token)
                expect(result.data.data.modGetTypes.types[0].completed).to.be.true
                expect(result.data.data.modGetTypes.types[1].completed).to.be.true
            })
        })

        describe('Deactivate', function () {

            it('Cannot deactivate completed when not logged in', async function () {
                const promise = graphql(SET_TYPE_COMPLETE_MUTATION, { id: 1, value: false })
                return expect(promise).to.be.rejectedWith(['401'])
            })

            it('Cannot deactivate completed when not logged in as super user', async function () {
                const promise = graphql(SET_TYPE_COMPLETE_MUTATION, { id: 1, value: false }, User3.token)
                return expect(promise).to.be.rejectedWith(['401'])
            })
            it('Can deactivate completed', async function () {
                const result = await graphql(SET_TYPE_COMPLETE_MUTATION, { id: 1, value: false }, SuperUser.token)
                const success = result.data.data.setTypeComplete
                return expect(success).to.be.false
            })

            it('After activation completed list is correct', async function () {
                const result = await graphql(MOD_GET_TYPES_QUERY, {}, SuperUser.token)
                expect(result.data.data.modGetTypes.types[0].completed).to.be.true
                expect(result.data.data.modGetTypes.types[1].completed).to.be.false
            })
        })
    })

    describe('Reviewed', function () {

        describe('Activate', function () {

            it('Cannot activate reviewed when not logged in', async function () {
                const promise = graphql(SET_TYPE_REVIEWED_MUTATION, { id: 1, value: true })
                return expect(promise).to.be.rejectedWith(['401'])
            })

            it('Cannot activate reviewed when not logged in as super user', async function () {
                const promise = graphql(SET_TYPE_REVIEWED_MUTATION, { id: 1, value: true }, User3.token)
                return expect(promise).to.be.rejectedWith(['401'])
            })

            it('Can activate reviewed', async function () {
                const result = await graphql(SET_TYPE_REVIEWED_MUTATION, { id: 1, value: true }, SuperUser.token)
                const success = result.data.data.setTypeReviewed
                return expect(success).to.be.true
            })

            it('After activation reviewed list is correct', async function () {
                const result = await graphql(MOD_GET_TYPES_QUERY, {}, SuperUser.token)
                expect(result.data.data.modGetTypes.types[0].reviewed).to.be.true
                expect(result.data.data.modGetTypes.types[1].reviewed).to.be.true
            })
        })

        describe('Deactivate', function () {

            it('Cannot activate reviewed when not logged in', async function () {
                const promise = graphql(SET_TYPE_REVIEWED_MUTATION, { id: 2, value: false })
                return expect(promise).to.be.rejectedWith(['401'])
            })

            it('Cannot activate reviewed when not logged in as super user', async function () {
                const promise = graphql(SET_TYPE_REVIEWED_MUTATION, { id: 2, value: false }, User3.token)
                return expect(promise).to.be.rejectedWith(['401'])
            })

            it('Can activate reviewed', async function () {
                const result = await graphql(SET_TYPE_REVIEWED_MUTATION, { id: 2, value: false }, SuperUser.token)
                const success = result.data.data.setTypeReviewed
                return expect(success).to.be.false
            })

            it('After activation reviewed list is correct', async function () {
                const result = await graphql(MOD_GET_TYPES_QUERY, {}, SuperUser.token)
                expect(result.data.data.modGetTypes.types[0].reviewed).to.be.false
                expect(result.data.data.modGetTypes.types[1].reviewed).to.be.true
            })
        })
    })
});