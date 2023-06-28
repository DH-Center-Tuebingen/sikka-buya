<template>
    <div class="box fint-box">
        <h2>
            <a href="https://www.fint-ikmk.uni-tuebingen.de/ikmk/home">
                <Locale path="custom.fint.title" />
            </a>
        </h2>

        <form
            class="flex row"
            method="post"
            action="https://www.fint-ikmk.uni-tuebingen.de/ikmk/quick_search?lang=de"
        >
            <input
                type="hidden"
                name="search_type"
                value="quick_search"
            >
            <input
                name="quick_search_value"
                type="text"
                style="flex:1"
            >

            <button
                style="margin-left: 1rem;"
                type="submit"
            >
                <Icon
                    type="mdi"
                    :path="icons.search"
                    :size="20"
                />
                <Locale path="general.search" />
            </button>
        </form>
    </div>
</template>

<script>
import Locale from "../cms/Locale"
import iconMixin from '../mixins/icon-mixin';
import { mdiMagnify } from '@mdi/js';

export default {
    components: { Locale },
    mixins: [iconMixin({ 'search': mdiMagnify })]
};
</script>

<style lang='scss' scoped>
$fint-light-blue: #8eb5c7;
$fint-dark-blue: #1d6a8e;

.fint-box {
    border: 2px solid $fint-dark-blue;
    // background-color: $fint-light-blue;
    // color: $dark-white;

    h2 {
        font-size: 1.3rem;
        line-height: 1.3em;
        margin-top: 0;
        color: white;
    }

    a {
        color: $fint-dark-blue;
        text-decoration: underline;
    }

    button {
        background-color: $fint-dark-blue;
    }
}
</style>