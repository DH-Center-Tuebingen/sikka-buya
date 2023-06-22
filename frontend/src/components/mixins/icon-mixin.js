
/**
 * Mixin for icons
 * 
 * @param {map(key, icon)} icons - map of icons to be used in the component
 * @returns 
 */

import Icon from "@jamescoyle/vue-icon"

export default function (icons) {
    return {
        components: {
            Icon
        },
        data() {
            return {
                icons
            }
        }
    }
}