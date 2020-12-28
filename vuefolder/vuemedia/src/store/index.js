import Vue from 'vue'
import Vuex from 'vuex'
import account from './modules/account'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);
Vue.use(require('vue-moment'));

const store = new Vuex.Store({
    modules: {
        account,
      },
    plugins: [createPersistedState()]
});

export default store