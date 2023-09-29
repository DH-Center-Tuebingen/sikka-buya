const { WriteableDatabase } = require("../src/utils/database");
const { log, error, success, notice } = require("./modules/logging");



async function main() {
    const results = await WriteableDatabase.manyOrNone(`SELECT name, location, uncertain FROM mint`)

    if(results){
        for(let mint of results){
            //Check if mint region already exists
            const mintRegion = await WriteableDatabase.oneOrNone(`SELECT id FROM mint_region WHERE name = $1`, [mint.name])

            if(mintRegion){
                log(`Mint region ${mint.name} already exists`)
            }else{
                log(`Mint region ${mint.name} does not exist. Creating...`)
                await WriteableDatabase.none(`INSERT INTO mint_region(name, uncertain, location) VALUES($1, $2, $3)`, [mint.name, mint.uncertain || false, mint.location])
                notice(`Mint region ${mint.name} created`)
            }
        }
    }else {
        throw new Error("No results")
    }
}

main().then(() => {
    success("Script finished successfully. See above for details.");
    process.exit(0);
}).catch((message) => {
    error(message);
    process.exit(1);
});