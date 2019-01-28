import Vue from 'vue'
import App from './App.vue'

/* *** Use `umd` version *** */
// import '../../dist/min.css'
// import Datatable from '../../dist/min.js'

/* *** Use `module` version *** */
import skoAutocomplete from '../../src/sko-autocomplete.vue'

//Vue.use(skoAutocomplete);

new Vue({
    el: '#app'
    , render: h => h(App)
});
