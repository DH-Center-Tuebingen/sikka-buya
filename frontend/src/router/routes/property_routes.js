import { camelCase } from 'lodash'

export default class PropertyRoute {
    constructor(name, component) {
        this.name = name
        this.component = component
    }

    static from(name, component) {
        return new PropertyRoute(name, component)
    }

    get routes() {
        return [
            this.createRoute,
            this.editRoute
        ]
    }

    get createRoute() {
        return {
            path: `${this.name}/create`,
            name: `Create${camelCase(this.name)}`,
            component: this.component
        }
    }

    get editRoute() {
        return {
            path: `${this.name}/:id`,
            name: `Edit${camelCase(this.name)}`,
            component: this.component
        }
    }
}