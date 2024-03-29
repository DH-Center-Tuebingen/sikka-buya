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
import CMSView from '@/components/cms/CMSView'


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
import InitialSetup from "@/components/page/InitialSetup.vue"
import UserManagementPage from "@/components/page/UserManagementPage.vue"
import FixDiff from "@/components/page/FixDiff.vue"
import PageNotFoundPage from "@/components/page/system/PageNotFoundPage"
import ServerOfflinePage from "@/components/page/system/ServerOfflinePage"
import SettingsPage from "@/components/page/SettingsPage.vue"

import EditorPanel from "@/components/page/EditorPanel.vue"
import ExpertSearch from "@/components/page/editor/ExpertSearch.vue"

import Overview from "@/components/page/Overview.vue"
import ColorOverview from "@/components/page/ColorOverview"

import FileListPage from "@/components/page/FileListPage.vue"

import TypeOverview from "@/components/page/TypeOverview.vue"

import CoinMarkForm from "@/components/page/property/CoinMarkForm"
import CoinVerseForm from "@/components/page/property/CoinVerseForm"
import EpochForm from "@/components/page/property/EpochForm"
import HonorificForm from "@/components/page/property/HonorificForm"
import DynastyForm from "@/components/page/property/DynastyForm"
import LocaleForm from "@/components/page/property/LocaleForm"
import MaterialForm from "@/components/page/property/MaterialForm"
import MintForm from "@/components/page/property/MintForm"
import MintRegionForm from "@/components/page/property/MintRegionForm"
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
import PropertyRoute from './routes/property_routes.js'
import ManagedConfig from "../utils/ManagedConfig.js"
import SettingsTemplate from '../../settings.json'


Vue.use(VueRouter)
const mconfig = new ManagedConfig("project_settings", SettingsTemplate["project_settings"])


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
        path: "hoards",
        name: "Hoards Map",
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
        path: "/bibliography",
        component: RouterContainer,
        disabled: mconfig.getBoolean("bibliography.disabled", false),
        children: [
          {
            path: "", name: "Bibliography", component: CMSView, props: {
              group: "bibliography",
              single: true,
              headingTag: "h1"
            }
          },
        ]
      },
      {
        path: "/cms/single/:group",
        props: route => {
          return {
            single: true,
            group: route.params.group
          }
        },
        name: "CMSSingle",
        component: CMSEditPage
      }, {
        path: "cms/list/:group",
        props: true,
        name: "CMSList",
        component: CMSListPage
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
                disabled: mconfig.getBoolean("catalog.analytics_table.disabled", false)
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
                title: "routes.Hoards Map",
                to: { name: "Hoards Map" },
                identity: "map-landing-treasure-map-link",
                disabled: mconfig.getBoolean("map.hoards.disabled")

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
            path: 'settings',
            name: "Settings",
            component: SettingsPage,
            meta: { super: true },
          },
          {
            path: "type",
            name: "TypeOverview",
            component: TypeOverview,
            props: { adminView: true }
          },
          {
            path: "person",
            name: "PersonOverview",
            props: {
              property: "person"
            },
            component: ColorOverview
          },
          {
            path: "material",
            name: "MaterialOverview",
            props: {
              property: "material"
            },
            component: ColorOverview
          }, {
            path: "treasure",
            name: "TreasureOverview",
            props: {
              property: "treasure"
            },
            component: ColorOverview
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
          ...PropertyRoute.from('coin_mark', CoinMarkForm).routes,
          ...PropertyRoute.from('coin_verse', CoinVerseForm).routes,
          ...PropertyRoute.from('epoch', EpochForm).routes,
          ...PropertyRoute.from('material', MaterialForm).routes,
          ...PropertyRoute.from("person", PersonForm).routes,
          ...PropertyRoute.from("title", TitleForm).routes,
          ...PropertyRoute.from("honorific", HonorificForm).routes,
          ...PropertyRoute.from("mint", MintForm).routes,
          ...PropertyRoute.from("mint_region", MintRegionForm).routes,
          ...PropertyRoute.from("nominal", NominalForm).routes,
          ...PropertyRoute.from("role", RoleForm).routes,
          ...PropertyRoute.from("dynasty", DynastyForm).routes,
          ...PropertyRoute.from("province", ProvinceForm).routes,
          ...PropertyRoute.from("treasure", TreasureForm).routes,
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
        component: FileListPage,
        disabled: mconfig.getBoolean("bibliography.disabled", false),
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
    console.trace("Redirecting to", route)
    next(route)
  } else {
    next()
  }
})

export default router
