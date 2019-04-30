<template>
    <div>
        <section class="hero is-primary is-bold mb-2">
            <div class="hero-body">
                <div class="container">
                    <h1 class="title">
                        Scout Kirk Olson's Vue2 Autocomplete component
                    </h1>
                    <h2 class="subtitle">
                    Input field component to select predefined values or type a custom value using Vue.js v2
                    </h2>
                </div>
            </div>
        </section>

        <section class="container">
            <div class="card">
                <div class="card-header">
                    Autocomplete example #1
                </div>

                <div class="container row">
                    <div class="col-md-3 p-2">
                        <label>Type a cast member</label>
                        <br />

                        <sko-autocomplete
                            :clear-button           = "false"
                            :copy-display           = "false"
                            :min-search-length      = "3"
                            name                    = "cast_id"
                            name-display            = "cast_name"
                            placeholder             = ""
                            results-property        = "data"
                            results-display         = "name"
                            results-value           = "id"
                            :show-no-results        = "false"
                            :source                 = "[{id:1,name:'Jerry Seinfeld'},{id:2,name:'George Costanza'},{id:3,name:'Cosmo Kramer'}, {id:4,name:'Elaine Benes'}]"
                            style                   = "padding:0px;"
                            v-model                 = "cast_id"
                            :display-value.sync     = "cast_name"
                        >
                        </sko-autocomplete>
                    </div>

                    <div class="col-md-3">
                        <label style="width:35%;">Cast id</label>
                        <input style="width:60%;" v-model="cast_id" readonly />
                        <br />

                        <label style="width:35%;">Cast name</label>
                        <input style="width:60%;" v-model="cast_name" readonly />
                    </div>

                    <div class="col-md-6 p-2">
                        <label>Code</label>
                        <pre>
                            <code>
&lt;sko-autocomplete
    :clear-button           = "false"
    :copy-display           = "false"
    :min-search-length      = "3"
    name                    = "cast_id"
    name-display            = "cast_name"
    placeholder             = ""
    results-property        = "data"
    results-display         = "name"
    results-value           = "id"
    :show-no-results        = "false"
    :source                 = "[{id:1,name:'Jerry Seinfeld'},{id:2,name:'George Costanza'},{id:3,name:'Cosmo Kramer'}, {id:4,name:'Elaine Benes'}]"
    style                   = "padding:0px;"
    v-model                 = "cast_id"
    :display-value.sync     = "cast_name"
&gt;
&lt;/sko-autocomplete&gt;
                            </code>
                        </pre>
                    </div>

                </div>
            </div>

            <div class="card mt-5">
                <div class="card-header">
                    Autocomplete example #2
                </div>

                <div class="container row">
                    <div class="col-md-3 p-2">
                        <label>Pick a country</label>
                        <br />

                        <sko-autocomplete
                            :clear-button           = "true"
                            :min-search-length      = "3"
                            name                    = "country_id"
                            placeholder             = ""
                            results-property        = "data"
                            results-display         = "name"
                            results-value           = "id"
                            :show-no-results        = "true"
                            :source                 = "[{id:'NL',name:'Netherlands'},{id:'BE',name:'Belgium'},{id:'LX',name:'Luxembourg'}]"
                            style                   = "padding:0px;"
                            v-model                 = "country_id"
                        >
                            <template slot="noResults">
                                <h5>Huh??</h5>
                            </template>
                        </sko-autocomplete>
                    </div>

                    <div class="col-md-3">
                        <label style="width:35%;">Country id</label>
                        <input style="width:60%;" v-model="country_id" readonly />
                        <br />

                        <label style="width:35%;">Country name</label>
                        <input style="width:60%;" v-model="country_name" readonly />
                    </div>

                    <div class="col-md-6 p-2">
                        <label>Code</label>
                        <pre>
                            <code>
&lt;sko-autocomplete
    :clear-button           = "true"
    :copy-display           = "true"
    :min-search-length      = "3"
    name                    = "country_id"
    placeholder             = ""
    results-property        = "data"
    results-display         = "name"
    results-value           = "id"
    :show-no-results        = "false"
    :source                 = "[{id:'NL',name:'Netherlands'},{id:'BE',name:'Belgium'},{id:'LX',name:'Luxemburg'}]"
    style                   = "padding:0px;"
    v-model                 = "country_id"
&gt;
    &lt;template slot="noResults"&gt;
        &lt;h5&gt;Huh??&lt;/h5&gt;
    &lt;/template&gt;

&lt;/sko-autocomplete&gt;
                            </code>
                        </pre>
                    </div>

                </div>
            </div>

        </section>
    </div>
</template>

<script>
    import skoAutocomplete from '../../src/sko-autocomplete.vue'

    export default {
        data: function() {
            return {
                cast_id         : null
                , cast_name     : null
                , country_id    : null
                , country_name  : null
            };
        }

        , components: {
            skoAutocomplete
        }

        , mounted: function() {
        }
    }
</script>