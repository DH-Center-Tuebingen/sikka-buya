export function rulersFromCoin(coin) {
    let rulers = [];
    if (coin.issuers && coin.issuers.length > 0) rulers.push(coin.issuers);
    if (coin.overlords && coin.overlords.length > 0)
        rulers = [...rulers, ...coin.overlords];
    if (coin.caliph) rulers.push(coin.caliph);
    return rulers;
}

export function dataFromRulers(rulers, selected = []) {
    let data = rulers
    let sel = false
    if (Array.isArray(rulers)) {
        data = []
        rulers.forEach(ruler => {
            const { data: subdata, selected: anyIsSelected } = dataFromRulers(ruler, selected)
            if (anyIsSelected) sel = true
            data.push(subdata)
        })
    } else {
        const ruler = rulers

        sel = true
        if (selected.length > 0) {
            sel = selected.indexOf(ruler.id) !== -1
        }

        let fillColor = !sel ? "#dddddd" : ruler.color || "#ff00ff"


        data = {
            data: ruler,
            fillColor,
            color: "#fff",
            stroke: true,
            weight: 1
        }
    }

    return { data, selected: sel }
}

export function coinsToRulerData(coins, selected = []) {
    let data = []
    let sel = false
    coins.forEach(coin => {
        let { data: rulerData, selected: sel2 } = dataFromRulers(rulersFromCoin(coin), selected)
        sel = sel2
        data.push({
            groupData: coin,
            data: rulerData
        })
    })

    return { data, selected: sel }
}
