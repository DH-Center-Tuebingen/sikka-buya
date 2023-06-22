import Time from '../../utils/Time'

export default {
    methods: {
        time_mixin_formatDate(timestamp) {
            return Time.formatDate(timestamp)
        },
        time_mixin_timestampToDateInputValue(timestamp) {
            return Time.timestampToDateInputValue(timestamp)
        }
    }
}