import Vue from "vue";
import Vuex from "vuex";
import pathify, { make } from "vuex-pathify";
import type {AppState} from "@/types";

const state: AppState =  {
  activeCountry: "US",
  filters: []
}

const mutations = make.mutations(state);

// store
Vue.use(Vuex);
export default new Vuex.Store({
  // use the plugin
  plugins: [pathify.plugin],
  // properties
  state,
  mutations,
});
