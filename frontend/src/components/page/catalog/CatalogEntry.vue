<template>
  <div class="catalog-entry">
    <notes
v-if="hasInternalNotes"
:html="type.internalNotes"
/>
    <type-view
v-if="!loading"
:type="type"
/>
    <div
v-else
class="center-frame"
>
      <loading-spinner :size="LoadingSpinnerSize.Big" />
    </div>
  </div>
</template>

<script>
import Query from '../../../database/query';
import Notes from '../../forms/Notes.vue';
import LoadingSpinner from '../../misc/LoadingSpinner.vue';
import TypeView from '../TypeView.vue';

export default {
  name: 'CatalogEntry',
  components: {
    TypeView,
    LoadingSpinner,
    Notes,
  },
  data: function () {
    return {
      loading: true,
      type: {
        id: null,
        projectId: '',
        treadwellId: '',
        mint: { id: null, name: '', uncertain: false },
        mintAsOnCoin: '',
        material: { id: null, name: '' },
        nominal: { id: null, name: '' },
        yearOfMint: '',
        donativ: false,
        procedure: 'pressed',
        issuers: [],
        overlords: [],
        otherPersons: [],
        caliph: { id: null, name: '', role: null },
        avers: {
          fieldText: '',
          innerInscript: '',
          intermediateInscript: '',
          outerInscript: '',
          misc: '',
        },
        reverse: {
          fieldText: '',
          innerInscript: '',
          intermediateInscript: '',
          outerInscript: '',
          misc: '',
        },
        cursiveScript: false,
        pieces: [],
        specials: '',
        internalNotes: null,
        completed: false,
        reviewed: false
      },
    };
  },
  computed: {
    id() {
      return this.$route.params.id;
    },
    hasInternalNotes() {
      if (!this.type || !this.type.internalNotes) return false;
      else {
        let parser = new DOMParser();
        let document = parser.parseFromString(
          this.type.internalNotes,
          'text/html'
        );

        return document.body.textContent.trim() !== '';
      }
    },
  },
  created() {
    Query.raw(
      `

        {
            getCoinType(id:${this.id}){
                id
                projectId
                treadwellId
                mint {
                  id,
                  name,
                  location 
                }
                mintAsOnCoin
                mintUncertain
                material {
                  id,
                  name
                }
                nominal {
                  id,
                  name
                }
                yearOfMint
                yearUncertain
                donativ
                procedure
                issuers {
                    id,
                    name,
                    role {
                      id, name

                  }
                  titles {
                    id,
                    name
                  }
                  honorifics{
                    id,
                    name}
                }
                overlords {
                  id
                  rank
                    name,
                    role {
                      id, name
                    }
                  titles {
                    id,
                    name
                  }
                  honorifics{
                    id,
                    name}
                }
                otherPersons {
                  id
                  name
                  shortName
                  role {
                    id, name
                  }
                }
                caliph {
                  id
                  name
                  role {
                    id, name
                  }
                }
                avers {
                  fieldText
                  innerInscript
                  intermediateInscript
                  outerInscript
                  misc
                }
                reverse {
                  fieldText
                  innerInscript
                  intermediateInscript
                  outerInscript
                  misc
                }
                cursiveScript
                literature
                pieces
                specials
                excludeFromTypeCatalogue
                excludeFromMapApp
                internalNotes
                reviewed
                completed
        }
      }
      `
    )
      .then((result) => {
        const data = result.data.data.getCoinType;
        Object.assign(this.$data.type, data);
        this.loading = false;
      })
      .catch(() => {
        this.$router.push({ name: 'PageNotFound' });
      });
  },
};
</script>

<style lang="scss" scoped>
.catalog-entry {
  padding-bottom: 200px;
}

.center-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
