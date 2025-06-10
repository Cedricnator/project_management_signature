import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './styles.css'

import App from './App.vue'
import router from './router'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faFileInvoice,
    faStar,
    faPenToSquare,
    faRobot,
    faPaperPlane, faEnvelope, faLock,
    faHouse,
    faArrowRightFromBracket,
    faXmark,
    faUser,
    faMagnifyingGlass,
    faListUl,
    faFileArrowDown,
    faPlus,
    faCircleCheck,
    faCircleXmark,
    faCircleInfo,
    faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
/* adds icons */
library.add(faStar)
library.add(faPenToSquare)
library.add(faRobot)
library.add(faPaperPlane)
library.add(faEnvelope)
library.add(faLock)
library.add(faHouse)
library.add(faFileInvoice)
library.add(faArrowRightFromBracket)
library.add(faXmark)
library.add(faUser)
library.add(faMagnifyingGlass)
library.add(faListUl)
library.add(faFileArrowDown)
library.add(faPlus)
library.add(faCircleCheck)
library.add(faCircleXmark)
library.add(faCircleInfo)
library.add(faTriangleExclamation)

/* pinia */
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(pinia)
app.use(router)

app.mount('#app')
