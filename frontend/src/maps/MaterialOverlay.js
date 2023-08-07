import { concentricCircles } from "../maps/graphics/ConcentricCircles"
import Mint from "../models/map/mint"
import L from "leaflet"
import Overlay from './Overlay'
import MaterialStats from '../models/material/MaterialStats'
import { MintLocationMarker } from '../models/mintlocation'

import Color from '../utils/Color'


export default class MaterialOverlay extends Overlay {

    constructor(parent, settings, callbacks) {

        callbacks.onFeatureGroupAdded = (featureGroup) => {
            featureGroup.on('mouseover', () => featureGroup.bringToFront());
            featureGroup.on('click', () => featureGroup.bringToFront());
        }

        callbacks.onFeatureGroupRemoved = (featureGroup) => {
            featureGroup.off('mouseover');
            featureGroup.off('click');
        }

        super(parent, settings, callbacks)
    }


    toMapObject(data) {
        const mints = data.reduce((prev, type) => {
            const mint = type.mint;

            if (mint.id) {
                if (!prev[mint.id]) {
                    prev[mint.id] = mint.location || {};
                    prev[mint.id].data = {
                        mint,
                        types: [],
                        materialStats: new MaterialStats(),
                    };
                }

                prev[mint.id].data.materialStats.add(type.material);
                prev[mint.id].data.types.push(type);
            }
            return prev;
        }, {});

        return { geoJSON: Object.values(mints) };
    }

    createMarker(latlng, feature) {

        const materialArrays = Object.values(feature.data.materialStats.get()).map(({ material }) => {
            let data = {
                material,
                fillOpacity: 1,
                fillColor: material.color
            }


            return data

        }).sort((a, b) => {
            if (!a.name) return 1
            else a.name.localeCompare(b.name)
        })

        const materialCircles = concentricCircles(latlng, materialArrays, {
            innerRadius: 5,
            radius: this.settings.settings.maxRadius,
            styles: [
                {
                    stroke: true,
                    color: Color.MissingColor,
                    weight: 1.5,
                },
            ]
        });

        let mlm = new MintLocationMarker(feature.data.mint);
        let marker = mlm.create(latlng);
        if (marker.getLayers) {
            marker = marker.getLayers()
        } else {
            marker = [marker]
        }
        const featureGroup = L.featureGroup([...marker, materialCircles]);
        featureGroup.bindPopup(this.mintLocationPopup(feature.data));
        featureGroup.bringToFront();
        return featureGroup;

    }

    filter(data) {
        console.log(data)
        return data.types.filter((d) => d.mint?.location);
    }

    mintLocationPopup(data) {
        const mint = data.mint ? data.mint : new Mint();
        const types = data?.types ? data.types : [];

        return `
        ${Mint.popupMintHeader(mint, ["no-bottom-margin", "underlined-header"])}
        <div class="popup-body" make-simplebar>
            <div class="popup-content grid col-3">
        ${types
                .map((type) => {
                    if (type.excludeFromTypeCatalogue) {
                        return `<span class="no-catalog-entry" style="color: ${type.material.color}">
                            ${type.projectId}
                        </span>`
                    } else
                        return `<a href="${type.route.href}" style="color: ${type.material.color}" target="_blank">${type.projectId}</a>`;
                })
                .join('')}
                </div>
        </div>`;
    }
}