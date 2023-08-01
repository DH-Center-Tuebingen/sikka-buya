import Vue from "vue"
import VueRouter from 'vue-router'

/**
 * Mains:
 * 
 * Mains are the first layer inside the App.vue.
 * This allows us to change the 'environment' of the
 * app, on differents parts of the application.
 * 
 * E.G. Most of the time we want the usual navigation + 
 * content section. But on the map we want to reduce the
 * navigation or eliminate it completely.
 */

import CommonMain from "@/components/main/CommonMain"
import RouterContainer from "@/components/page/RouterContainer.vue"


//** AUTH */
import LoginPage from "@/components/page/auth/LoginPage"
import AcceptInvitePage from "@/components/page/auth/AcceptInvitePage"

/**
 * CMS
 */


import CMSEditPage from '@/components/page/cms/CMSEditPage'
import CMSListPage from '@/components/page/cms/CMSListPage'


/**
 * Analytics
 */
import YearMintTablePage from "@/components/page/analytics/YearMintTablePage"


/**
 * Catalog
 */
import CatalogEntry from "@/components/page/catalog/CatalogEntry.vue"
import CardLinkPage from "@/components/page/CardLinkPage.vue"
import CatalogFilterSearch from "@/components/page/catalog/CatalogFilterSearch.vue"
import PersonPage from "@/components/page/catalog/PersonPage.vue"

/**
 * Editor Page
 */
import EditorPage from "@/components/page/editor/EditorPage.vue"
import LandingPage from "@/components/page/LandingPage.vue"
import ContactPage from "@/components/page/ContactPage.vue"
import CreateTypePage from "@/components/page/CreateTypePage.vue"
import CoinMarkOverview from "@/components/page/CoinMarkOverview.vue"
import CoinVerseOverview from "@/components/page/CoinVerseOverview.vue"
import InitialSetup from "@/components/page/InitialSetup.vue"
import UserManagementPage from "@/components/page/UserManagementPage.vue"
import FixDiff from "@/components/page/FixDiff.vue"
import PageNotFoundPage from "@/components/page/system/PageNotFoundPage"
import ServerOfflinePage from "@/components/page/system/ServerOfflinePage"

import EditorPanel from "@/components/page/EditorPanel.vue"
import ExpertSearch from "@/components/page/editor/ExpertSearch.vue"

import Overview from "@/components/page/Overview.vue"
import PersonOverview from "@/components/page/PersonOverview"
import MaterialOverview from "@/components/page/MaterialOverview"

import FileListPage from "@/components/page/FileListPage.vue"

import TypeOverview from "@/components/page/TypeOverview.vue"

import CoinMarkForm from "@/components/page/property/CoinMarkForm"
import CoinVerseForm from "@/components/page/property/CoinVerseForm"
import HonorificForm from "@/components/page/property/HonorificForm"
import DynastyForm from "@/components/page/property/DynastyForm"
import LocaleForm from "@/components/page/property/LocaleForm"
import MaterialForm from "@/components/page/property/MaterialForm"
import MintForm from "@/components/page/property/MintForm"
import NominalForm from "@/components/page/property/NominalForm"
import PersonForm from "@/components/page/property/PersonForm"
import ProvinceForm from "@/components/page/property/ProvinceForm"
import RoleForm from "@/components/page/property/RoleForm"
import TitleForm from "@/components/page/property/TitleForm"
import TreasureForm from "@/components/page/property/TreasureForm"
import Auth from "../utils/Auth.js"


/**
 * Maps
 */
import MapPage from "@/components/page/MapPage.vue"
import PoliticalMap from "@/components/map/PoliticalMap"
import TreasureMap from "@/components/map/TreasureMap"
import MaterialMap from "@/components/map/MaterialMap"
import PlaygroundPage from "@/components/map/Playground"


import TemplatePage from "@/components/page/TemplatePage"
import { componentTestRoutes } from "@/component-test.js"
import { superUserIsSet } from '../utils/Setup.js'
import store from '../store.js'

Vue.use(VueRouter)



const routes = [
  {
    path: "/template",
    component: TemplatePage
  },
  {
    name: "Server Offline",
    path: "/offline",
    component: ServerOfflinePage
  },
  ...componentTestRoutes,
  {
    path: "/map/",
    name: "MapPage",
    component: MapPage,
    meta$gene: { hideHub: true },
    redirect: {
      name: "Political Map"
    },
    children: [
      {
        path: '',
        name: 'Political Map',
        component: PoliticalMap
      },
      {
        path: "additional",
        name: "Additional Maps",
        component: MaterialMap
      },
      {
        path: "treasure",
        name: "Treasure Map",
        component: TreasureMap
      },
      // TODO: Remove
      {
        path: "playground",
        name: "Playground",
        component: PlaygroundPage
      },
    ]
  }, {
    path: "/",
    redirect: { name: "Home" }
  }, {
    path: "/home",
    name: "Home",
    component: LandingPage
  },
  {
    path: "",
    component: CommonMain,
    children: [
      {
        path: "/contact",
        name: "Contact",
        component: ContactPage
      },
      {
        path: "/cms/single/:group",
        props: true,
        name: "CMSSingle",
        component: CMSEditPage
      },
      {
        path: "cms/:group/:id",
        name: "CMSEditPage",
        props: true,
        component: CMSEditPage,
      },
      {
        path: "cms/:group",
        props: true,
        name: "CMSList",
        component: CMSListPage
      },
      {
        path: '/catalog/',
        component: RouterContainer,
        name: 'Catalog',
        redirect: { name: "Catalog Overview" },
        children: [{
          path: '',
          name: "Catalog Overview",
          component: CardLinkPage,
          props: {
            title: "routes.catalog",
            links: [
              {
                title: 'routes.catalog Ruler Explorer',
                identity: "catalog-link-page-ruler-explorer",
                to: { name: "Catalog Ruler Explorer" }
              },
              {
                title: "routes.catalog Search",
                identity: "catalog-link-page-search",
                to: { name: "Catalog Search" }
              },
              {
                title: "routes.Analytics Table",
                identity: "catalog-link-page-table",
                to: { name: "Analytics Table" },
                disabled: true
              }
            ]
          }
        }, {
          path: 'search',
          name: 'Catalog Search',
          component: CatalogFilterSearch
        }, {
          path: 'ruler',
          name: 'Catalog Ruler Explorer',
          component: PersonPage
        },
        {
          path: ':id',
          name: 'Catalog Entry',
          component: CatalogEntry
        },
        {
          path: "/analytics",
          name: "Analytics Table",
          component: YearMintTablePage
        },
        ]
      }, {
        path: "/map-overview",
        name: "Map Overview",
        component: RouterContainer,
        redirect: { name: "Map Landing" },
        children: [
          {
            path: "",
            name: "Map Landing",
            component: CardLinkPage,
            props: {
              title: "routes.map",
              links: [{
                title: "routes.Political Map",
                to: { name: 'Political Map' },
                identity: "map-landing-political-map-link",
              },
              {
                title: "routes.Additional Maps",
                to: { name: 'Additional Maps' },
                identity: "map-landing-additional-map-link"
              },

              {
                title: "routes.Treasure Map",
                to: { name: "Treasure Map" },
                identity: "map-landing-treasure-map-link",
                disabled: true
              }
              ]
            },
          }]
      },
      {
        path: '/setup',
        name: 'InitialSetup',
        component: InitialSetup
      },
      {
        path: '/login',
        name: 'Login',
        component: LoginPage
      },
      {
        path: '/invite/:mail',
        name: "InviteSignUp",
        component: AcceptInvitePage
      },
      {

        path: "/editor/",
        component: EditorPage,
        meta$gene: { auth: true },
        children: [
          {
            path: "",
            name: "Editor",
            component: EditorPanel,

          }, {
            path: "expert_search",
            name: "ExpertSearch",
            component: ExpertSearch,
          },
          {
            path: "fixdiff",
            name: "FixDiff",
            component: FixDiff,

          },
          {
            path: 'user',
            name: 'UserManagement',
            component: UserManagementPage,
            meta: { super: true }
          },
          {
            path: "type",
            name: "TypeOverview",
            component: TypeOverview,
            props: { adminView: true }
          },
          {
            path: "coin_mark",
            name: "CoinMarkOverview",
            component: CoinMarkOverview
          }, {
            path: "coin_verse",
            name: "CoinVerseOverview",
            component: CoinVerseOverview
          },
          {
            path: "person",
            name: "PersonOverview",
            component: PersonOverview
          },
          {
            path: "material",
            name: "MaterialOverview",
            component: MaterialOverview
          },
          {
            path: ":property",
            name: "Property",
            component: Overview,
            props: true
          },
          {
            path: 'type/create',
            name: 'TypeCreationPage',
            component: CreateTypePage
          }, {
            path: 'type/edit/:id',
            name: 'EditType',
            component: CreateTypePage
          },
          {
            path: "coin_mark/create",
            name: "CreateCoinMark",
            component: CoinMarkForm
          }, {
            path: "coin_mark/:id",
            name: "EditCoinMark",
            component: CoinMarkForm
          },
          {
            path: "coin_verse/create",
            name: "CreateCoinVerse",
            component: CoinVerseForm
          }, {
            path: "coin_verse/:id",
            name: "EditCoinVerse",
            component: CoinVerseForm
          }, {
            path: "material/create",
            name: "CreateMaterial",
            component: MaterialForm
          }, {
            path: "material/:id",
            name: "EditMaterial",
            component: MaterialForm
          }, {
            path: "person/create",
            name: "CreatePerson",
            component: PersonForm
          }, {
            path: "person/:id",
            name: "EditPerson",
            component: PersonForm
          }, {
            path: "title/create",
            name: "CreateTitle",
            component: TitleForm
          }, {
            path: "title/:id",
            name: "EditTitle",
            component: TitleForm
          }, {
            path: "honorific/create",
            name: "CreateHonorific",
            component: HonorificForm
          }, {
            path: "honorific/:id",
            name: "EditHonorific",
            component: HonorificForm
          }, {
            path: "mint/create",
            name: "CreateMint",
            component: MintForm
          }, {
            path: "mint/:id",
            name: "EditMint",
            component: MintForm
          }, {
            path: "nominal/create",
            name: "CreateNominal",
            component: NominalForm
          }, {
            path: "nominal/:id",
            name: "EditNominal",
            component: NominalForm
          }, {
            path: "role/create",
            name: "CreateRole",
            component: RoleForm
          }, {
            path: "role/:id",
            name: "EditRole",
            component: RoleForm
          }, {
            path: "dynasty/create",
            name: "CreateDynasty",
            component: DynastyForm
          }, {
            path: "dynasty/:id",
            name: "EditDynasty",
            component: DynastyForm
          }, {
            path: "province/create",
            name: "CreateProvince",
            component: ProvinceForm
          }, {
            path: "province/:id",
            name: "EditProvince",
            component: ProvinceForm
          },
          {
            path: "treasure/create",
            name: "TreasureCreate",
            component: TreasureForm
          },
          {
            path: "treasure/:id",
            name: "TreasureCreate",
            component: TreasureForm
          },
          {
            path: "locale/:lang/:path",
            name: "Locale",
            component: LocaleForm
          }
        ]
      },
      {
        path: "working-papers",
        name: "Working Papers",
        props: {
          orderBy: "created"
        },
        component: FileListPage
      },
      {
        path: "/404",
        name: "PageNotFound",
        component: PageNotFoundPage
      },
      {
        path: "*",
        name: "PageNotFoundFallback",
        component: PageNotFoundPage
      }
    ]
  }
]

function iterateOverChildren(routes, callback, data = {}) {
  routes.forEach(route => {
    const returnedData = callback(route, data)
    if (route.children) {
      iterateOverChildren(route.children, callback, returnedData)
    }
  })
}

iterateOverChildren(routes, (route, data) => {
  let d = {}
  for (const key of Object.keys(route)) {
    if (key.endsWith("$gene")) {
      const geneName = key.replace("$gene", "")
      d[geneName] = route[key]
      delete data[key]
    }
  }
  for (let [key, value] of Object.entries(data)) {
    d[key] = value
    route[key] = value
  }
  return d
})

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {

    /**
     * Dont change scroll if we stay on same site.
     * E.g. reload while reading an article.
     */
    if (to.name == from.name) {
      return false
    }

    /**
     * You may specify a scrollgroup for sites, that should retain scroll on 
     * reload. E.g. in tab-like routed component.
     */
    if (!to.scrollGroup || !from.scrollGroup) {
      return { x: 0, y: 0 }
    }

    if (savedPosition) {
      return savedPosition
    } else {
      const position = {}
      if (to.hash && document.querySelector(to.hash)) {
        position.selector = to.hash
        return position
      }
      return false
    }
  }
})



router.beforeEach(async (to, from, next) => {
  let route = null

  /**
   * As the 'store errors' are shown in the `App.vue`
   * on a global level, we must manually reset them on 
   * navigation.
   */
  store.commit("resetErrors");

  if (to.name == "InitialSetup") {
    let superUserSet = false
    try {
      superUserSet = await superUserIsSet()
    } catch (e) {
      //Fail silently
      route = e
    }
    if (superUserSet)
      route = { name: "Home" }
  } else if (to.fullPath === "/") to = next({ name: "Home" })
  else {
    if (to.matched.some(record => record.meta.auth)) {
      let auth = false
      try {
        auth = await Auth.check()
        if (!auth) {
          const error = "Bitte loggen Sie sich ein!"
          route = {
            name: "Login", params: {
              error
            }
          }
          // store.commit("printError", error)
        }
      } catch (e) {
        //Fail silently
        route = e
      }
    }
  }

  if (route) {
    console.log("Redirecting to", route)
    next(route)
  } else
    next()
})

export default router
