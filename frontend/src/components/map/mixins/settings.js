export default function (settings) {
    return {
        data() {
            return {
                overlay: null,
                overlaySettings: settings,
            }
        },
        methods: {
            resetSettings() {
                this.overlay.settings.reset();
                this.$emit('reset');
            },
            overlaySettingsChanged(name, value) {
                this.overlay.settings.change(name, value);
            },
            toggleSettings() {
                this.overlay.settings.toggle('uiOpen');
            },
        }
    }
}