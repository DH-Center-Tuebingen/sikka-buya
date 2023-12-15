import Settings from '../settings';
import Color from '../utils/Color';
import Mint from './map/mint';

var L = require('leaflet');

export default class MintLocation {
    constructor({
        markerOptions = {},
        createMarker = null,
        bindPopup = null
    }) {
        this.markerOptions = markerOptions
        this.iconSize = this.markerOptions.radius * 3 / 2
        this.bindPopupCallback = bindPopup
        this.createMarkerCallback = createMarker
    }


    mapToGeoJsonFeature(mints) {
        return Object.values(mints).map(mint => {

            let location = mint.location
            if (typeof mint.location == "string") {
                try {
                    location = JSON.parse(mint.location);
                } catch (e) {
                    location = { type: null, coordinates: null }
                }
            }

            return {
                type: location.type,
                coordinates: location.coordinates,
                mint: mint
            };
        });
    }

    createGeometryLayer(features, selectedMints = []) {
        let that = this
        let layer = new L.geoJSON(features, {
            pointToLayer: function (feature, latlng) {
                const mintId = feature?.data?.mint?.id
                const active = (mintId) ? mintId : false
                return that.createMarker.call(that, latlng, feature, { active })
            },
            coordsToLatLng: function (coords) {
                return new L.LatLng(coords[0], coords[1], coords[2]);
            }
        });

        return layer
    }

    createMarker(latlng, feature, { active = false, added = false, removed = false } = {}) {
        let marker = null

        if (this.createMarkerCallback)
            marker = this.createMarkerCallback(latlng, feature)
        else {
            let locationMarker = new MintLocationMarker(feature.mint)
            marker = locationMarker.create(latlng, { active, added, removed })
        }
        if (this.bindPopupCallback)
            marker.bindPopup(this.bindPopupCallback(feature))
        else {
            marker.bindPopup(Mint.popupMintHeader(feature.mint, ["underlined-header"]));
        }
        return marker
    }
}


export class MintLocationMarker {

    constructor(mint) {
        this.mint = mint
        this._circleMarker = null
    }

    static get defaultSize() {
        return 6
    }


    static get normalStyle() {
        return {
            fillColor: Color.White,
            color: Color.DarkGray,
        }
    }

    static get activeStyle() {
        return {
            fillColor: Color.DarkGray,
            color: Color.White,
        }
    }

    get circleMarker() {
        return this._circleMarker
    }

    create(latlng, { size = MintLocationMarker.defaultSize, active = false, added = false, removed = false, animationTime = 1000 } = {}) {
        const MintLocationMarkerSettings = new Settings(window, "MintLocationMarker")

        let classList = ["circle-marker"]

        const isSpecial = (added || removed)

        if (isSpecial) {
            if (added && active) classList.push("added")
            else if (removed) classList.push("removed")
        }

        const style = (active) ? MintLocationMarker.activeStyle : MintLocationMarker.normalStyle

        const circleMarker = L.circleMarker(latlng, Object.assign(MintLocationMarkerSettings.load(), {
            radius: size,
            weight: 1,
            className: classList.join(" ")
        }, style))



        if (isSpecial) {
            setTimeout(() => {
                if (circleMarker._path) {
                    circleMarker._path.classList.remove("added")
                    circleMarker._path.classList.remove("removed")
                }
            }, animationTime)
        }


        if (this.mint.uncertain) {
            const uncertainIcon = L.svgIcon(latlng, {
                path: "M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.67,14.17C13,15 13,16 13,17H10C10,15.33 10,13.92 10.67,12.92C11.33,11.92 12.67,11.33 13.5,10.67C15.92,8.43 15.32,5.26 12,5A3,3 0 0,0 9,8H6A6,6 0 0,1 12,2Z",
                width: size * 5 / 3,
                height: size * 5 / 3,
                scale: (size / 15),
                interactive: false,
                fillColor: (active) ? Color.White : Color.Black
            })

            const MintLocationMarkerUncertainIconSettings = new Settings(window, "MintLocationMarkerUncertainIcon")

            uncertainIcon.setStyle(MintLocationMarkerUncertainIconSettings.load())

            uncertainIcon.bringToFront()
            this.marker = L.featureGroup([circleMarker, uncertainIcon])
        } else {
            this.marker = circleMarker
        }

        if (isSpecial) {
            this.marker.isSpecial = true
        }

        this._circleMarker = circleMarker
        return this.marker
    }
}

export class CountMarker {
    constructor(size = 20) {
        this.size = size
    }

    create(latlng, num) {
        // const size = this.markerOptions.radius * 2
        const icon = L.divIcon({
            className: "mint-location-div-marker",
            html: `${num}`,
            iconSize: [this.size, this.size],
            iconAnchor: [this.size / 2, this.size / 2]
        })

        return L.marker(latlng, { icon })
    }
}