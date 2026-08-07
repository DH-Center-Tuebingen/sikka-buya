import Compare from "./Compare.mjs";

export default class Async {
    static sleep(seconds) {
        return new Promise((r) => setTimeout(r, seconds));
    }
}

/**
 * A RequestGuard will receive a function that executes a request.
 * 
 * When executinge the callback using the exec method, the RequestGuard
 * the request will be sent immediately. If another request is sent
 * before the first one is finished, the RequestGuard will queue the
 * request and execute it as soon as the first one is finished.
 */
export class RequestGuard {
    constructor(callback, {
        before = null,
    } = {}) {
        if (!callback || typeof callback !== "function")
            throw new Error(`RequestGuard requires a callback function, got ${typeof callback}.`)

        this.reqCount = 0
        this.current = 0
        this.locked = false
        this.value = null
        this.before = before
        this.callback = callback
    }

    /**
     * Executes the callback function. If the RequestGuard is locked,
     * the request will be queued and executed as soon as the RequestGuard
     * is unlocked.
     * 
     * @param {any} value The value to pass to the callback function.
     * @returns {Promise<any>} The return value of the callback function.
     *  
     */
    async exec(value) {
        this.reqCount++
        let returnValue = null
        this.value = value
        if (!this.locked) {
            do {
                this.locked = true
                let current = this.reqCount
                let value = this.value

                if(this.before) this.before(value)

                try {
                    returnValue = await this.callback(value)
                } catch (e) {
                    console.error(e)
                } finally {
                    this.current = current
                    this.locked = false
                }
            } while (this.reqCount > this.current && !Compare.deep(this.value, value, 12))

            /**
             * When equilibrium is reached, we can reset the 
             * variables to prevent overflow.
             */
            this.reqCount = 0
            this.current = 0
            return returnValue
        } else {
            // console.log("RequestGuard is locked, the request was queued.", this.reqCount, this.value)
        }
        return null
    }

}

export class Timeout {
    constructor() {
        this.timeout = null
    }

    async set(callback, ms) {
        if (this.timeout !== null) throw new Error("Timeout already set! Maybe you missed to clear it?")
        this.timeout = setTimeout(callback, ms)
    }

    clear() {
        clearTimeout(this.timeout)
        this.timeout = null
    }
}
