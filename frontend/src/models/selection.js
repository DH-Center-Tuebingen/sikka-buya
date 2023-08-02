export default class Selection {
    constructor(...arr) {
        this.clear()
        if (arr.length > 0) {
            arr.forEach(id => this.add(id))
        }
    }

    toggle(id) {
        console.log("Toggle", this.has(id))
        if (this.has(id)) this.remove(id)
        else this.add(id)
    }

    add(id) {
        this.list[id] = true
    }

    remove(id) {
        delete this.list[id]
    }

    set(id, val) {
        if (val) this.add(id)
        else this.remove(id)
    }

    clear() {
        this.list = {}
    }

    get() {
        return Object.keys(this.list)
    }

    has(id) {
        return this.list[id] === true
    }

}