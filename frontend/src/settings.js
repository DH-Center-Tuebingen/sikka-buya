
import URLParams from "./utils/URLParams"

function toNumber(a) {
    return parseFloat(a)
}

const Parser = {
    Map: {
        zoom: toNumber
    }
}

const Validators = {
    Map: {
        location: function (value) {
            return (Array.isArray(value) && value.length == 2 && !isNaN(value[0]) && !isNaN(value[1]))
        }
    }
}

export const DefaultSettings = {
    Map: {
        location: [30.521645759075508, 48.890055500146026],
        zoom: 6
    },
    Timeline: {
        active: true,
        value: 333
    },
    Slideshow: {
        active: false
    },
    MintLocationMarker: {
        radius: 6,
        stroke: true,
        weight: 1,
        color: "#333",
        fillColor: 'white',
        fillOpacity: 1,
    },
    MintLocationMarkerUncertainIcon: {
        stroke: false,
        color: "#666666",
        fillOpacity: 1
    },
    Overlay: {
        uiOpen: false,
    },
    PoliticalOverlay: {
        _requires: ["Timeline", "Overlay"],
        innerRadius: 6,
        maxRadius: 30,
        maxRadiusMinimum: 10,
        maxRadiusMaximum: 100
    },
    MaterialOverlay: {
        _requires: ["Timeline", "Overlay"],
        innerRadius: 6,
        maxRadius: 14,
        maxRadiusMinimum: 10,
        maxRadiusMaximum: 50
    },
    TreasureOverlay: {

    }
}



export default class Settings {
    static get defaultSettings() {
        return DefaultSettings
    }


    static _getDefault(key) {
        if (!DefaultSettings[key]) throw new Error(`Key does not exist: ${key}.`)
        return DefaultSettings[key]
    }

    static getDefault(key = null) {
        let settings = Settings._getDefault(key)
        const requires = settings._requires || []
        for (let req = 0; req < requires.length; req++) {

            let required = this.getDefault(requires[req])
            settings = Object.assign({}, required, settings)

        }
        delete settings._requires
        return settings
    }

    static getStoragePath(key) {
        return "sikka-buya-settings-" + key.toLowerCase()
    }

    constructor(window, key) {
        this.key = key
        this.window = window
        this.settings = Settings.getDefault(key)
    }

    onSettingsChanged(fun) {
        this._onSettingsChanged = fun
    }

    overwriteWithQueryParams(vue, options) {
        for (let key of Object.keys(this.settings)) {
            let query = vue.$route.query[key]
            if (query) {

                try {
                    if (!options[key]) throw new Error(`No option for key '${key}' set.`)
                    query = URLParams.get(key, options[key])

                    if (this.validateSetting(key, query)) {
                        this.change(key, query)
                    }
                } catch (e) {
                    console.warn(`Couldn't parse query setting '${this.key}/${key}': ${query}`)
                }
            }
        }
    }


    /**
     * Call it once on startup. 
     * Setups all localStorage items, so that all 
     * are set on first startup.
     */
    static init(window) {
        Object.entries(this.defaultSettings).forEach(([name, settings]) => {
            const atStoragePath = Settings.getStoragePath(name)
            try {
                if (!window.localStorage.getItem(atStoragePath)) {
                    this._save(window, name, settings)
                }
            } catch (e) {
                console.warn(e)
            }
        })
    }

    update(data) {
        Object.assign(this.settings, data)
    }

    save() {
        Settings._save(this.window, this.key, this.settings)
    }

    static _save(window, key, data) {
        const atStoragePath = Settings.getStoragePath(key)
        try {
            window.localStorage.setItem(atStoragePath, JSON.stringify(data))
        } catch (e) {
            console.warn(e)
        }
    }

    load() {
        let settings = Object.assign({}, Settings.getDefault(this.key))
        const storagePath = Settings.getStoragePath(this.key)

        let dataString
        try {
            dataString = this.window.localStorage.getItem(storagePath)
        } catch (e) {
            console.warn(e)
        }
        if (dataString) {
            try {
                const parsedSettings = JSON.parse(dataString)
                for (let [key, val] of Object.entries(parsedSettings)) {

                    if (Parser[this.key]?.[key]) {
                        val = Parser[this.key][key](val)
                    }

                    parsedSettings[key] = this.validateSetting(key, val) ? val : settings[key]
                }
                settings = Object.assign({}, settings, parsedSettings)
            } catch (e) {
                console.error(`Could not load and apply local storage data: ${this.key}.`)
            }
        }

        this.settings = settings
        return settings
    }

    validateSetting(key, val) {
        if (Validators[this.key]?.[key]) {
            return Validators[this.key]?.[key](val)
        }
        return true
    }

    get(key) {
        return this.settings[key]
    }

    apply(vue) {
        const settings = this.load()
        Object.assign(this.settings, settings)
        for (let [name, value] of Object.entries(this.settings)) {
            vue.$set(vue.$data, name, value)
        }
    }

    toggle(key) {
        this._changed([[key, !this.settings[key]]])
    }

    multiChange(keyValPairs) {
        this._changed(keyValPairs)
    }

    change(key, value) {
        this._changed([[key, value]])
    }

    _changed(keyValPairs = []) {
        keyValPairs.forEach(([key, val]) => {
            this.settings[key] = val
        })

        this.save()
        if (this._onSettingsChanged)
            this._onSettingsChanged(keyValPairs)
    }


    reset() {
        let settings = Object.assign({}, Settings.getDefault(this.key))
        this._changed(Object.entries(settings))
    }
}