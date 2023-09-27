

import MintLocation from '../../../models/mintlocation';
import Query from '../../../database/query';
import Mint from '../../../models/map/mint';


const selectedMintStorageName = "active-mints"

function applyQuery(mintArray) {
    this.mints = mintArray.filter((mint) => mint.location != null);
    this.updateMintLocations()
}

export function loadSelectedMints() {
    let selectedMints = []
    try {
        selectedMints = window.localStorage.getItem(selectedMintStorageName)
        selectedMints = JSON.parse(selectedMints)
    } catch (e) {
        console.warn("Could not get available mints from localstorage.")
    }

    if (!Array.isArray(selectedMints)) {
        selectedMints = []
    }
    return selectedMints
}

export function MintLocationsMixin({
    showMarkers = true,
    onMintSelectionChanged = null,
    mintMarkerOptions = {
        radius: 5,
        stroke: false,
        fillColor: 'white',
        fillOpacity: 1,
    }
} = {}) {

    const selectedMints = loadSelectedMints()


    return {
        data() {
            return {
                mints: {},
                mintLocation: null,
                mintLocationLayer: null,
                selectedMints,
                availableMints: [],
                unavailableMints: [],
                addedMints: [],
                removedMints: [],
            }
        },
        unmounted: function () {
            if (this.mintLocationLayer) this.mintLocationLayer.clearLayers();
        },
        mounted() {
            this.selectedMints = loadSelectedMints()
            this.mintLocation = new MintLocation({ markerOptions: mintMarkerOptions, popup: this.mintLocationPopup });
        },
        methods: {

            mintLocationPopup(feature) {
                return Mint.popupMintHeader(feature.mint, ["underlined-header", "black"])
            },
            async fetchMints() {
                const result = await this.queryMints()
                applyQuery.call(this, result.data.data.mint)
            },
            async queryMints() {
                return Query.raw(`{${this.mintGraphQL}}`);
            },
            updateMintLocations() {
                if (showMarkers)
                    this.updateMintLocationMarker();
                this.updateAvailableMints();
            },
            updateAvailableMints() {
                let avalMints = {};
                let mints = this.mints;

                this.availableMints = Object.values(this.mints);

                if (this.types) {
                    for (let type of this.types) {
                        if (avalMints[type.mint.id] == null)
                            if (type.mint) {
                                const mintId = type.mint.id;

                                if (this.selectedRulers.length == 0) {
                                    avalMints[mintId] = type.mint;
                                } else {
                                    if (this.mintHasActiveRuler(type)) {
                                        avalMints[mintId] = type.mint;
                                    }
                                }
                            }
                    }

                    let unavailMints = [];
                    for (let mint of Object.values(mints)) {
                        if (!avalMints[mint.id]) {
                            unavailMints.push(mint);
                        }
                    }

                    this.availableMints = Object.values(avalMints);
                    this.unavailableMints = unavailMints;
                }
            },
            updateMintLocationMarker() {
                if (this.mintLocationLayer)
                    this.mintLocationLayer.clearLayers();

                let features = this.mintLocation.mapToGeoJsonFeature(this.mints);
                this.mintLocationLayer = this.mintLocation.createGeometryLayer(features, this.selectedMints);
                this.mintLocationLayer.addTo(this.featureGroup);
            },
            async mintSelectionChanged({ active = [], added = [], removed = [], }, { preventUpdate = false, preserveSelections = false } = {}) {
                this.selectedMints = active;
                this.addedMints = added
                this.removedMints = removed

                if (onMintSelectionChanged)
                    onMintSelectionChanged.call(this, this.selectedMints)
                if (!preventUpdate) await this.update();

                try {
                    window.localStorage.setItem(selectedMintStorageName, JSON.stringify(this.selectedMints))
                } catch (e) {
                    console.warn(e)
                }

                if (!preserveSelections) {
                    this.addedMints = []
                    this.removedMints = []
                }
            },
            clearMintSelection({ preventUpdate = false } = {}) {
                this.mintSelectionChanged({ active: [], removed: this.selectedMints }, { preventUpdate });
            },
            selectAllMints() {
                const allIds = this.mints.map((mint) => mint.id)
                const selection = this.generateAddedAndRemovedSelection(allIds)
                this.mintSelectionChanged(selection);
            },
            generateAddedAndRemovedSelection(nextSelection) {
                let added = nextSelection.slice()
                let removed = []

                this.selectedMints.forEach(mintId => {
                    const index = nextSelection.indexOf(mintId)
                    if (index != -1) {
                        added.splice(index, 1)
                    } else {
                        removed.push(mintId)
                    }
                })


                return { active: nextSelection, added, removed }
            }
        },
        computed: {
            mint_locations_mixin_noneSelected() {
                return this.selectedMints.length === 0;
            },
            allMintsSelected() {
                return this.selectedMints.length === this.mints.length;
            },
            mintGraphQL() {
                return `mint {
                id
                name
                location 
                uncertain
                province {
                  id
                  name
                }
              }`
            },

        }
    }
}