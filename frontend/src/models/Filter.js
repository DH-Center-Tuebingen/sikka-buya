import StringUtils from '../utils/StringUtils';



export default class Filter {

    constructor(name) {
        this.name = name
    }

    static searchPrefix = "__search"


    static searchVariableName(name) {
        return Filter.searchPrefix + StringUtils.capitalize(name)
    }

    static _createMethodName(methodName, filterName) {
        return methodName + StringUtils.capitalize(filterName) + "Filter"
    }

    static selectMethodName(name) {
        return Filter._createMethodName("select", name)
    }

    static removeMethodName(name) {
        return Filter._createMethodName("remove", name)
    }

    static hasMethodName(name) {
        return Filter._createMethodName("has", name)
    }

    static mapData(name, value = []) {
        return {
            [name]: value,
            [Filter.searchVariableName(name)]: { id: null, name: '' }
        }
    }

    mapData(value = []) {
        return Filter.mapData(this.name, value)
    }

    mapMethods() {
        return {
            [Filter.selectMethodName(this.name)]: this.selectFilter(this.name),
            [Filter.removeMethodName(this.name)]: this.removeFilterItem(this.name),
            [Filter.hasMethodName(this.name)]: this.hasFilter(this.name),
        }
    }


    selectFilter() {
        const name = this.name
        return function (target) {
            if (!this["has" + StringUtils.capitalize(name) + "Filter"](target)) {
                target.id = parseInt(target.id)
                this.filters[name].push(target);
            }
            this.filters[Filter.searchVariableName(name)] = { id: null, name: '' };
        }
    }

    removeFilterItem() {
        const name = this.name
        return function (target) {

            if (this["has" + StringUtils.capitalize(name) + "Filter"](target)) {
                this.filters[name] = this.filters[name].filter(
                    (el) => el.id != target.id
                );
            }
        }
    }

    hasFilter() {
        const name = this.name
        return function (target) {
            let id = parseInt(target.id)

            if (isNaN(id)) return false

            return this.filters[name]
                .map((el) => parseInt(el.id))
                .includes(id);
        }
    }
}

export class FilterList extends Filter {
    static pushMethodName(name) {
        return Filter._createMethodName("push", name)
    }

    static mapData(name, value = [[]]) {
        return {
            [name]: value
        }
    }

    mapMethods() {
        let obj = super.mapMethods()
        return Object.assign(obj,
            { [FilterList.pushMethodName(this.name)]: this.pushFilterGroup(this.name) }
        )
    }

    hasFilter() {
        const name = this.name
        return function (target, index) {

            let id = parseInt(target.id)
            if (isNaN(id)) return false

            return this.filters[name]?.[index]
                .map((el) => el.id)
                .includes(id);
        }
    }

    selectFilter() {
        const name = this.name
        return function (target, idx) {
            if (!this["has" + StringUtils.capitalize(name) + "Filter"](target, idx)) {
                target.id = parseInt(target.id)
                if (this.filters[name][idx])
                    this.filters[name][idx].push(target);
            }
            this.filters[Filter.searchVariableName(name)] = { id: null, name: '' };
        }
    }

    removeFilterItem() {
        const name = this.name
        return function (target, idx) {
            if (this["has" + StringUtils.capitalize(name) + "Filter"](target, idx)) {

                if (this.filters[name][idx]) {
                    for (let i = this.filters[name][idx].length - 1; i >= 0; i--) {
                        const value = this.filters[name][idx][i]
                        if (value.id == target.id) {
                            this.filters[name][idx].splice(i, 1)
                        }
                    }
                }
            } else {
                console.error("Could not find filter(" + target.id + ") in " + name + " at index " + idx)
            }
        }
    }

    pushFilterGroup() {
        const name = this.name
        return function (value = []) {
            this.filters[name].push(value)
        }
    }

}