<template>
    <div class="person-form">
        <PropertyFormWrapper
            property="person"
            :loading="property_form_mixin_loading"
            :title="property_form_mixin_title"
            :error="property_form_mixin_error"
            :disabled="property_form_mixin_disabled"
            :dirty="property_form_mixin_dirty"
            :overwrite-route="{ name: 'PersonOverview' }"
            @submit="property_form_mixin_submit"
            @cancel="property_form_mixin_cancel"
        >
            <input
                id="person-id"
                v-model="person.id"
                type="hidden"
            >

            <label for="person-name">Name</label>
            <input
                id="person-name"
                v-model="person.name"
                type="text"
                :placeholder="$tc('attribute.name')"
                autofocus
                required
            >

            <label for="person-short-name">Kurzname</label>
            <input
                id="person-short-name"
                v-model="person.shortName"
                type="text"
                :placeholder="$tc('attribute.shortName')"
            >

            <label for="person-role">Rolle</label>
            <DataSelectField
                id="person-role"
                v-model="person.role"
                table="person_role"
                attribute="name"
                query-command="searchRole"
            />

            <label for="person-dynasty">Dynastie</label>
            <DataSelectField
                id="person-dynasty"
                v-model="person.dynasty"
                table="dynasty"
                attribute="name"
            />

            <label for="person-color">Farbe</label>
            <ColorInput
                id="person-color"
                v-model="person.color"
            />

            <label for="person-reign">Regierungszeit</label>
            <RangeInput
                id="person-reign"
                v-model="person.reign"
            />
        </PropertyFormWrapper>
    </div>
</template>

<script>
import Query from '../../../database/query.js';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';
import DataSelectField from '@/components/forms/DataSelectField.vue';
import ColorInput from '@/components/forms/ColorInput.vue';
import RangeInput from '@/components/forms/RangeInput.vue';

import PropertyFormMixinFunc from '../../mixins/property-form-mixin-func';

export default {
    name: 'PersonForm',
    components: {
        RangeInput,
        PropertyFormWrapper,
        DataSelectField,
        ColorInput,
    },
    mixins: [
        PropertyFormMixinFunc({ variable: "person", property: "person" })
    ],
    data: function () {
        return {
            person: {
                id: -1,
                name: '',
                shortName: '',
                reign: { from: null, to: null },
                role: { id: null, name: '' },
                dynasty: { id: null, name: '' },
                color: '#000000',
            },
        };
    },
    methods: {
        getProperty: async function (id) {
            const result = await Query.raw(`
            query ($id : ID!){
                getPerson(id: $id){
                id
                name
                shortName
                role {
                    id
                    name
                }
                dynasty {
                    id
                    name
                }
                color
                reign {
                    from
                    to
                    }
                }
            }`, { id });

            let person = result.data.data.getPerson;
            if (person.color === null) person.color = '#ffffff';
            if (person.role == null) person.role = ' ';
            return person
        },
        updateProperty: async function (id) {
            let query;
            let queryName;

            let variables = {
                name: this.person.name,
                shortName: this.person.shortName,
                role: this.person.role.id,
                dynasty: this.person.dynasty.id,
                color: this.person.color,
                reign_from: this.person.reign.from,
                reign_to: this.person.reign.to,
            };

            if (this.person.id && this.person.id > 0) {
                variables.id = this.person.id;
                queryName = "updatePerson"
                query = `mutation($id:ID!, $name: String,$shortName: String, $role:ID, $dynasty:ID, $color:String, $reign_from: Int, $reign_to: Int)
                            {
                                ${queryName} (
                                    id: $id,
                                    data: {
                                    name: $name,
                                    shortName: $shortName,
                                    role: $role,
                                    dynasty: $dynasty,
                                    color: $color
                                    reign: {
                                        from: $reign_from,
                                        to: $reign_to
                                    }
                                    }
                                )
                            }`;
            } else {
                queryName = "addPerson"
                query = `mutation($name: String,$shortName: String, $role:ID, $dynasty:ID, $color:String, $reign_from: Int, $reign_to: Int)
                            {
                                ${queryName} (
                                    data: {
                                    name: $name,
                                    shortName: $shortName,
                                    role: $role,
                                    dynasty: $dynasty,
                                    color: $color
                                        reign: {
                                            from: $reign_from,
                                            to: $reign_to
                                        }
                                    }
                                )
                            }`;
            }

            const result = await Query.raw(query, variables)
            this.person = result.data.data[queryName]
        }
    },
};
</script>
