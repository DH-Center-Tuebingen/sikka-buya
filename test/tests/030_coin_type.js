const chai = require('chai')
const expect = chai.expect
const { graphql } = require('../helpers/graphql')
const { User1 } = require('../mockdata/users')
const gql = String.raw

const {
  COIN_TYPE_BODY,
  GERMAN_TYPE,
  FRENCH_TYPE,
  GERMAN_TYPE_WHEN_LOGGED_IN,
  FRENCH_TYPE_WHEN_LOGGED_IN,
  ATLANTIS_TYPE,
  ATLANTIS_INPUT,
  ATLANTIS_INPUT_UPDATED,
  ATLANTIS_TYPE_UPDATED,
} = require('../mockdata/type.mock')


chai.config.truncateThreshold = 0
chai.config.showDiff = true


describe(`Type Queries`, function () {
  it(`List`, async function () {
    let result = await graphql(`{ coinType{
      types {
      ${COIN_TYPE_BODY}
    }}}`)
    expect(result.data).to.deep.equal({
      "data": {
        "coinType": {
          "types": [
            FRENCH_TYPE,
            GERMAN_TYPE,
          ]
        }
      }
    })
  })

  it(`List when logged in`, async function () {
    let result = await graphql(`{ coinType{
        types {
        ${COIN_TYPE_BODY}
      }}}`, {}, User1.token)

    expect(result.data).to.deep.equal({
      "data": {
        "coinType": {
          "types": [
            FRENCH_TYPE_WHEN_LOGGED_IN,
            GERMAN_TYPE_WHEN_LOGGED_IN,
          ]
        }
      }
    })
  })

  it("Get", async function () {
    let result = await graphql(`
          {
              getCoinType(id:2) {
                  ${COIN_TYPE_BODY}
              }
          }
  `)

    expect(result.data).to.deep.equal({
      "data": {
        "getCoinType": FRENCH_TYPE
      }
    })
  })

  it("Get when logged in", async function () {
    let result = await graphql(`
          {
              getCoinType(id:2) {
                  ${COIN_TYPE_BODY}
              }
          }
  `, {}, User1.token)

    expect(result.data).to.deep.equal({
      "data": {
        "getCoinType": FRENCH_TYPE_WHEN_LOGGED_IN
      }
    })
  })

  it("Search with regular characters", async function () {
    let result = await graphql(`
          {
            coinType(filters:{plain_text: "frevo1789"}){
              pageInfo {page count last total}
              types { 
                ${COIN_TYPE_BODY}
              }
            }
          }`)

    expect(result.data).to.deep.equal({
      "data": {
        "coinType": {
          "pageInfo": {
            "page": 0,
            "count": 20,
            "last": 0,
            "total": 1
          },
          "types": [
            FRENCH_TYPE
          ]
        }
      }
    })
  })

  it("Search with exact characters", async function () {
    let result = await graphql(`
           {
            coinType(filters:{plain_text: "FRévô1789"}){
              pageInfo {page count last total}
              types { 
                ${COIN_TYPE_BODY}
              }
            }
          }`)

    expect(result.data).to.deep.equal({
      "data": {
        "coinType": {
          "pageInfo": {
            "page": 0,
            "count": 20,
            "last": 0,
            "total": 1
          },
          "types": [
            FRENCH_TYPE
          ]
        }
      }
    })
  })

  it("Cannot find internal notes", async function () {
    let result = await graphql(`
           {
            coinType(filters:{plain_text: "Überprüfen"}){
              pageInfo {page count last total}
              types { 
                ${COIN_TYPE_BODY}
              }
            }
          }`)

    expect(result.data).to.deep.equal({
      "data": {
        "coinType": {
          "pageInfo": {
            "page": 0,
            "count": 20,
            "last": 0,
            "total": 0
          },
          "types": [

          ]
        }
      }
    })
  })


  it("Can find internal notes when logged in", async function () {
    let result = await graphql(`
           {
            coinType(filters:{plain_text: "Überprüfen"}){
              pageInfo {page count last total}
              types { 
                ${COIN_TYPE_BODY}
              }
            }
          }`, {}, User1.token)

    expect(result.data).to.deep.equal({
      "data": {
        "coinType": {
          "pageInfo": {
            "page": 0,
            "count": 20,
            "last": 0,
            "total": 1
          },
          "types": [
            FRENCH_TYPE_WHEN_LOGGED_IN
          ]
        }
      }
    })
  })

  it("Unauthorized Add Rejected", async function () {
    let promise = graphql(`mutation{addCoinType(data: ${ATLANTIS_INPUT})}`)
    await expect(promise).to.be.rejectedWith(["401"])
  })

  it("Add", async function () {
    let promise = graphql(`mutation{addCoinType(data: ${ATLANTIS_INPUT})}`, {}, User1.token)
    await expect(promise).to.be.fulfilled
  })

  it("Add was successfull", async function () {
    let result = await graphql(`{coinType{ types {${COIN_TYPE_BODY}}}}`, {}, User1.token)

    expect(result.data.data).to.deep.equal({
      "coinType": {
        "types": [
          ATLANTIS_TYPE,
          FRENCH_TYPE_WHEN_LOGGED_IN,
          GERMAN_TYPE_WHEN_LOGGED_IN,
        ]
      }
    })
  })

  it("Unauthorized Update Rejected", async function () {
    let promise = graphql(`mutation{updateCoinType(id:3,data: ${ATLANTIS_INPUT_UPDATED} )}`)
    await expect(promise).to.be.rejectedWith(["401"])
  })

  it("Update", async function () {
    let promise = graphql(`mutation{updateCoinType(id:3,data:${ATLANTIS_INPUT_UPDATED})}`, {}, User1.token)
    await expect(promise).to.be.fulfilled
  })

  it("Updated Values are correct", async function () {
    let result = await graphql(`
          {
              getCoinType(id:3) {
                  ${COIN_TYPE_BODY}
              }
          }`, {}, User1.token)

    expect(result.data.data.getCoinType).to.deep.equal(ATLANTIS_TYPE_UPDATED)
  })

  it("Unauthorized Delete Rejected", async function () {
    let promise = graphql(`mutation {
      deleteCoinType(id: 3)
    }`)
    await expect(promise).to.be.rejectedWith(["401"])
  })

  it("Delete Type", async function () {
    let promise = graphql(`mutation {
      deleteCoinType(id: 3)
    }`, {}, User1.token)

    await expect(promise).to.be.fulfilled
  })

  it("Was deleted succesfully", async function () {
    const result = graphql(` { 
      getCoinType(id: 3){
        projectId
      }
    }`)

    await expect(result).to.be.rejected
  })
})

