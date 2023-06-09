export const IconSize = {
    Tiny: 14,
    Normal: 18,
    Large: 24,
    Big: 30,
    Huge: 50,
    Gigantic: 100
}

export const LoadingSpinnerSize = {
    Small: 30,
    Normal: 50,
    Big: 100
}

export const ConfigMixin = {
    computed: {
        IconSize() {
            return IconSize
        },
        LoadingSpinnerSize() {
            return LoadingSpinnerSize
        }
    }
}

