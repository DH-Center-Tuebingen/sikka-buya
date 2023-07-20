
const ATLANTIS = {
    "id": "3",
    "name": "Ǎtlantis",
    "location": { type: "Point", coordinates: [40.450505694, 6.15439645] },
    "uncertain": true,
    "uncertainArea": { type: "Polygon", coordinates: [[[5.2734375, 41.697525911], [3.779296875, 40.838749138], [5.438232422, 39.300299186], [6.877441406, 39.283293869], [7.492675781, 40.513799155], [6.701660156, 41.557921578], [5.2734375, 41.697525911]]] },
    "province": {
        "id": "2",
        "name": "The Sea"
    }
}

const MINT_TEST_DATA = {
    "name": "Test",
    "id": "4",
    "location": { type: "Point", coordinates: [8, 49] },
    "uncertain": true,
    "uncertainArea": { type: "Polygon", coordinates: [[[7.020263672, 50.979182427], [6.712646484, 49.138596537], [9.008789062, 48.922499264], [9.184570312, 50.972264889], [7.020263672, 50.979182427]]] },
    "province": {
        "id": "1",
        "name": "France"
    }
}



const MINT_TEST_DATA_BODY = `{
    name: "Test",
    location: {type:"Point",coordinates:[8,49]},
    uncertain: true,
    uncertainArea: {type:"Polygon",coordinates:[[[7.020263671875,50.97918242660188],[6.712646484375,49.13859653703879],[9.0087890625,48.922499263758255],[9.184570312499998,50.972264889367494],[7.020263671875,50.97918242660188]]]}
    , province: 1
}`

const MINT_UPDATE_DATA_BODY = `
{
    name: "Renamed",
    location: {type:"Point",coordinates:[12,51]},
    uncertain: false,
    uncertainArea: {type:"Polygon",coordinates:[[[11,51],[11,51],[12,50],[12,50],[13,51],[12,51],[11,51]]]}
    , province: 2
}`


const BERLIN =
{
    "id": "1",
    "name": "Berlin",
    "location": { type: "Point", coordinates: [52.51968196, 13.376689258] },
    "uncertain": false,
    "uncertainArea": null,
    "province": {
        "id": "3",
        "name": "Germany"
    }

}

const PARIS = {
    "id": "2",
    "name": "Paris",
    "location": { type: "Point", coordinates: [48.863113497, 2.337794633] },
    "uncertain": false,
    "uncertainArea": null,
    "province": {
        "id": "1",
        "name": "France"
    }
}


const MINT_START_DATA = [
    ATLANTIS,
    BERLIN,
    PARIS
]

const MINT_GQL_BODY = `{id,name,location , uncertain,uncertainArea, province {id, name}}`


module.exports = {
    MINT_START_DATA,
    MINT_TEST_DATA,
    MINT_TEST_DATA_BODY,
    MINT_UPDATE_DATA_BODY,
    ATLANTIS,
    BERLIN,
    PARIS,
    MINT_GQL_BODY
}