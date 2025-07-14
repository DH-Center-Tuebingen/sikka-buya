import Mode from "../models/Mode";
import { cloneDeep } from "lodash";

export const FilterType = {
    text: "text",
    number: "number",
    buttonGroup: "button-group",
    threeWay: "three-way",
    multiSelect: "multi-select",
    multiSelect2D: "multi-select-2d"
}

const _filterConfig = {
    [FilterType.text]: [
        {
            label: 'property.project_id',
            name: 'projectId',
            order: -10,
        },
        {
            label: 'property.treadwell_id',
            name: 'treadwellId',
            order: -9,
        },
        {
            label: 'property.year_of_mint',
            name: 'yearOfMint',
            order: -3,
        },
    ],
    [FilterType.number]: [],
    [FilterType.buttonGroup]: [
        {
            label: 'property.procedure',
            name: 'procedure',
            options: ['pressed', 'cast'],
            labels: ['property.procedures.pressed', 'property.procedures.cast'],
            order: 2.5,
        },
    ],
    [FilterType.threeWay]: [
        {
            label: 'property.cursive_script',
            name: 'cursiveScript',
            order: 4.2,
        },
        {
            label: 'property.donativ',
            name: 'donativ',
            order: 4
        },
        {
            label: 'property.small_coin',
            name: 'small',
            order: 3.5
        },
        {
            label: 'property.year_uncertain',
            name: 'yearUncertain',
            order: 10
        },
        {
            label: 'property.mint_uncertain',
            name: 'mintUncertain',
            order: 9
        },],
    [FilterType.multiSelect]: [

        // multi-select
        {
            label: 'property.material',
            name: 'material',
            order: 0,
            mode: Mode.Or
        },
        {
            label: 'property.mint',
            name: 'mint',
            order: -5,
            mode: Mode.Or
        },
        {
            label: 'property.nominal',
            name: 'nominal',
            order: 3,
            mode: Mode.Or
        },
        {
            label: 'role.caliph',
            name: 'caliph',
            mode: Mode.Or,
            attribute: 'shortName',
            queryBody: ['id', 'shortName'],
            order: 4.11
        },
        {
            label: 'role.heir',
            name: 'heir',
            mode: Mode.Or,
            attribute: 'shortName',
            queryCommand: 'searchPersonsWithRole',
            queryBody: ['id', 'name', 'shortName', { role: ['id', 'name'] }],
            additionalParameters: {
                include: ['heir'],
            },
            order: 4.12
        },
        {
            label: 'property.other_person',
            name: 'otherPerson',
            queryCommand: 'searchPersonsWithRole',
            mode: Mode.Or,
            queryBody: ['id', 'name', 'shortName', { role: ['id', 'name'] }],
            additionalParameters: {
                exclude: ['caliph', 'heir'],
            },
            displayTextCallback: function (search) {
                return `${search.shortName || search.name} (${this.$tc(
                    `role.${search.role.name}`
                )})`;
            },
            order: 6,
            allowModeChange: true
        },
        {
            label: 'property.title',
            name: 'title',
            order: 7,
            mode: Mode.And,
            allowModeChange: true
        },
        {
            label: 'property.honorific',
            name: 'honorific',
            order: 8,
            mode: Mode.And,
            allowModeChange: true
        },
        {
            label: 'property.ruler',
            name: 'ruler',
            join: 'ruler',
            // This is somewhat unsatisfying to use a dynamic value as input for the buyids here.
            additionalParameters: { dynasty: 1 },
            queryCommand: 'searchPersonsWithoutRole',
            queryBody: ['id', 'name', 'shortName', { dynasty: ['id', 'name'] }],
            displayTextCallback: function (search) {
                let txt = search.shortName || search.name;
                if (search?.dynasty?.name) txt = `${txt} (${search.dynasty.name})`;
                return txt;
            },
            order: 4.1,
            allowModeChange: true,
            mode: Mode.And,
        },], [FilterType.multiSelect2D]: [
            // multi-select-2d
            {
                label: 'property.coin_mark',
                name: 'coinMark',
                order: 5,
                mode: Mode.And
            },
            {
                label: 'property.coin_verse',
                name: 'coinVerse',
                order: 4.8,
                mode: Mode.And
            },
        ]
}


function getDefaultValueByFilterType(type) {
    switch (type) {
        case FilterType.text:
            return "";
        case FilterType.number:
            return 0;
        case FilterType.buttonGroup:
            return null;
        case FilterType.threeWay:
            return null;
        case FilterType.multiSelect:
            return [];
        case FilterType.multiSelect2D:
            return [[]];
        default:
            throw new Error("No default value for filter type " + type)
    }
}

function applyDefaultValues(filterConfig) {
    return Object.entries(filterConfig).reduce((acc, [typeName, filters]) => {
        acc[typeName] = filters.map((filter) => {
            filter.type = typeName;
            filter.defaultValue = filter.defaultValue || getDefaultValueByFilterType(typeName);
            return filter;
        });
        return acc;
    }, {});
}

export const filterConfig = applyDefaultValues(_filterConfig);




let _expertConfig = cloneDeep(filterConfig);
const rulerOption = _expertConfig[FilterType.multiSelect].find(obj => obj.name === 'ruler')
if(!rulerOption) {
    throw new Error("Ruler configuration not found in filterConfig");
}
delete rulerOption.additionalParameters;
export const expertFilterConfig = applyDefaultValues(_expertConfig);



