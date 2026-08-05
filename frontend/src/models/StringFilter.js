import StringUtils from '../utils/StringUtils';



export default class StringFilter {

    constructor(name) {
        this.name = name
    }

    static searchPrefix = "__search"


    static searchVariableName(name) {
        return StringFilter.searchPrefix + StringUtils.capitalize(name)
    }

    static _createMethodName(methodName, filterName) {
        return methodName + StringUtils.capitalize(filterName) + "Filter"
    }

    static selectMethodName(name) {
        return StringFilter._createMethodName("select", name)
    }

    static removeMethodName(name) {
        return StringFilter._createMethodName("remove", name)
    }

    static hasMethodName(name) {
        return StringFilter._createMethodName("has", name)
    }

    static mapData(name, value = []) {
        return {
            [name]: value,
            [StringFilter.searchVariableName(name)]: ''
        }
    }

    mapData(value = []) {
        return StringFilter.mapData(this.name, value)
    }

    mapMethods() {
        return {
            [StringFilter.selectMethodName(this.name)]: this.selectFilter(this.name),
            [StringFilter.removeMethodName(this.name)]: this.removeFilterItem(this.name),
            [StringFilter.hasMethodName(this.name)]: this.hasFilter(this.name),
        }
    }


    selectFilter() {
        const name = this.name
        return function (target) {
            if (!this["has" + StringUtils.capitalize(name) + "Filter"](target)) {
                this.filters[name].push(target);
            }
            this.filters[StringFilter.searchVariableName(name)] = '';
        }
    }

    removeFilterItem() {
        const name = this.name
        return function (target) {

            if (this["has" + StringUtils.capitalize(name) + "Filter"](target)) {
                this.filters[name] = this.filters[name].filter(
                    (el) => el != target
                );
            }
        }
    }

    hasFilter() {
        const name = this.name
        return function (target) {
            return this.filters[name]
                .includes(target);
        }
    }
}
