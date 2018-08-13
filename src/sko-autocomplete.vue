<template>
    <div class="sko-aut">
        <div
            class   = "sko-aut-box"
            :class  = "[
                containerClass
                , disableInput ? containerDisableClass : ''
                , showResults ? 'sko-aut-searching' : ''
            ]"
        >

            <span v-if="searchButton">
                <img v-if="!isLoading" class="sko-aut-icon" src="./assets/search.svg">
                <img v-else class="sko-aut-icon sko-aut-animate-spin" src="./assets/loading.svg">
            </span>

            <div class="sko-aut-inputs">
                <input
                    :class          = "[
                        inputClass
                        , disableInput ? inputDisabledClass : ''
                        , (required && !display) ? inputRequiredClass : ''
                    ]"
                    :disabled       = "disableInput"
                    :required       = "required"
                    :placeholder    = "placeholder"
                    :type           = "inputType"
                    @blur           = "blur"
                    @click          = "search"
                    @focus          = "focus"
                    @input          = "search"
                    @keydown.enter  = "enter"
                    @keydown.tab    = "close"
                    @keydown.up     = "up"
                    @keydown.down   = "down"
                    @keydown.esc    = "close"
                    v-model         = "display"
                >
                <input :name="name" type="hidden" :value="value || initialValue">
                <input :name="nameDisplay" type="hidden" :value="display || initialDisplay">
            </div>

            <!-- clearButtonIcon -->
            <span v-show="clearButton && !disableInput && !isEmpty && !isLoading && !hasError" class="sko-aut-icon sko-aut-clear" @click="clear">
                <span v-if="clearButtonIcon" :class="clearButtonIcon"></span>
                <img v-else src="./assets/close.svg">
            </span>
        </div>

        <ul v-show="showResults" :class="['sko-aut-results', resultsClass]" :style="listStyle">
            <slot name="results">
                <!-- error -->
                <li v-if="hasError" class="sko-aut-results-item autocomplete__results__item--error">{{ error }}</li>

                <!-- results -->
                <template v-if="!hasError">
                    <slot name="firstResult"></slot>
                    <li
                        v-for           = "(result, key) in results"
                        :key            = "key"
                        @click.prevent  = "select(result)"
                        class           = "sko-aut-results-item"
                        :class          = "{'sko-aut-selected' : isSelected(key) }"
                        v-html          = "formatDisplay(result)">
                    </li>
                    <slot name="lastResult"></slot>
                </template>

                <!-- no results -->
                <li v-if="noResultMessage" class="sko-aut-results-item autocomplete__no-results">
                    <slot name="noResults">No Results.</slot>
                </li>
            </slot>
        </ul>
    </div>
</template>

<script type="text/babel">
    import debounce from 'lodash/debounce'

    export default {
        //PROPS
        props: {
            /**
             * Data source for the results
             *   `String` is a url, typed input will be appended
             *   `Function` received typed input, and must return a string; to be used as a url
             *   `Array` and `Object` (see `results-property`) are used directly
             */
            source: {
                type: [String, Function, Array, Object],
                required: true
            },

            /**
             * Source params
             */
            sourceparams: {
                type: [String, Function, Array, Object],
            },

            /**
             * CSS class for the surrounding input div
             */
            containerClass: {
                type: [String, Object]
            },
            /**
             * CSS class for the surrounding input div when disabled
             */
            containerDisableClass: {
                type: [String, Object]
            },

            /**
             * CSS class for the input
             */
            inputClass: {
                type: [String, Object]
            },

            /**
             * CSS class for the input when disabled
             */
            inputDisabledClass: {
                type: [String, Object]
            },

            /**
             * CSS class for the input when required
             */
            inputRequiredClass: {
                type: [String, Object]
            },

            /**
             * type of the input
             */
            inputType: {
                default: 'text',
                type: String
            },

            /**
             * Input placeholder
             */
            placeholder: {
                default: 'Search'
            },

            /**
             * To disable the input
             */
            disableInput: {
                default : false
                , type  : Boolean
            },

            /**
             * Required
             */
            required: {
                type: Boolean,
                default: false
            },

            /**
             * Preset starting value
             */
            initialValue: {
                type: [String, Number]
            },

            /**
             * Preset starting display value
             */
            initialDisplay: {
                type: String
            },

            /**
             * Copy display value to value when nothing is selected
             */
            copyDisplay: {
                default : false
                , type  : Boolean
            },

            /**
             * name property of the input holding the selected value
             */
            name: {
                type: String
            },

            /**
             * name property of the input holding the selected display
             */
            nameDisplay: {
                type: String
            },

            /**
             * api - property of results array
             */
            resultsProperty: {
                type: String
            },

            /**
             * Results property used as the value
             */
            resultsValue: {
                type: String,
                default: 'id'
            },

            /**
             * Results property used as the display
             */
            resultsDisplay: {
                type: [String, Function],
                default: 'name'
            },

            /**
             * CSS class for the results list
             */
            resultsClass: {
                default : ''
                , type  : [String, Object]
            },

            /**
             * Minimum input length to start searching
             */
            minSearchLength: {
                type: Number,
                default: 1
            },

            /**
             * Whether to show the no results message
             */
            showNoResults: {
                type: Boolean,
                default: true
            },

            /**
             * Additional request headers
             */
            requestHeaders: {
                type: Object
            },

            /**
             * Optional search button
             */
            searchButton: {
                type: Boolean,
                default: true
            },

            /**
             * search delay before starting new search (in milliseconds)
             */
            searchDelay: {
                type: Number,
                default: 200
            },

            /**
             * Optional clear button
             */
            clearButton: {
                type: Boolean,
                default: true
            },

            /**
             * Optional clear button icon class
             */
            clearButtonIcon: {
                type: String
            }
        },

        //DATA
        data () {
            return {
                value: null,
                display: null,
                results: null,
                selectedIndex: null,
                loading: false,
                isFocussed: false,
                error: null,
                selectedId: null,
                selectedDisplay: null,
                eventListener: false,
                position: {top:0, left: 0}
            }
        },
        watch: {
            'initialDisplay'    (newValue,oldValue) {
                let that    = this;

                if (!that.display
                ||  !that.value) {
                    that.display    = newValue;
                }

            }
        },
        computed: {
            showResults () {
                return Array.isArray(this.results) || this.hasError
            },
            noResults () {
                return Array.isArray(this.results) && this.results.length === 0
            },
            noResultMessage () {
                return this.noResults &&
                    !this.isLoading &&
                    this.isFocussed &&
                    !this.hasError &&
                    this.showNoResults
            },
            isEmpty () {
                return !this.display
            },
            isLoading () {
                return this.loading === true
            },
            hasError () {
                return this.error !== null
            },
            listStyle () {
                return {
                    position: 'absolute'
                    , top: this.position.top + 25
                }
                /*
                if (this.isLoading) {
                    return {
                        color: '#ccc'
                    }
                }
                */
            }
        },
        methods: {
            /**
             * Search wrapper method
             */
            search () {
                let searchFunc      = null;

                this.selectedIndex  = null;
                switch (true) {
                    case typeof this.source === 'string':
                        // No resource search with no input
                        if (!this.display || this.display.length < this.minSearchLength ) {
                            return
                        }
                        searchFunc =  debounce(() => this.resourceSearch(this.source + this.display), this.searchDelay)
                        return searchFunc();

                    case typeof this.source === 'function':
                        // No resource search with no input
                        if (!this.display || this.display.length < this.minSearchLength ) {
                            return
                        }
                        searchFunc =  debounce(() => this.resourceSearch(this.source + this.display), this.searchDelay)
                        return searchFunc();

                    case Array.isArray(this.source):
                        return this.arrayLikeSearch();

                    default:
                        throw new TypeError()
                }
            },

            /**
             * Search http resource
             * @param {String} url
             */
            resourceSearch (url) {
                if (!this.display) {
                    this.results = []
                    return
                }
                this.loading = true
                this.setEventListener()
                this.request(url)
            },

            /**
             * Make an http request for results
             * @param {String} url
             */
            request (url) {
                let promise = fetch(url, {
                    method: 'get',
                    credentials: 'same-origin',
                    headers: this.getHeaders()
                })

                return promise
                    .then(response => {
                        if (response.ok) {
                            this.error = null
                            return response.json()
                        }
                        throw new Error('Network response was not ok.')
                    })
                    .then(response => {
                        this.results = this.setResults(response)
                        if (this.results.length === 0) {
                            this.$emit('noResults', {query: this.display})
                        } else {
                            this.$emit('results', {results: this.results})
                        }
                        this.loading = false
                    })
                    .catch(error => {
                        this.error = error.message
                        this.loading = false
                    })
            },

            /**
             * Set some default headers and apply user supplied headers
             */
            getHeaders () {
                const headers = {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
                if (this.requestHeaders) {
                    for (var prop in this.requestHeaders) {
                        headers[prop] = this.requestHeaders[prop]
                    }
                }
                return new Headers(headers)
            },

            /**
             * Set results property from api response
             * @param {Object|Array} response
             * @return {Array}
             */
            setResults (response) {
                if (this.resultsProperty && response && response[this.resultsProperty]) {
                    return response[this.resultsProperty]
                }
                if (Array.isArray(response)) {
                    return response
                }
                return []
            },

            /**
             * Search in results passed via an array
             */
            arrayLikeSearch () {
                this.setEventListener()
                if (!this.display) {
                    this.results = this.source
                    this.$emit('results', {results: this.results})
                    this.loading = false
                    return true
                }
                this.results = this.source.filter((item) => {
                    return this.formatDisplay(item).toLowerCase().includes(this.display.toLowerCase())
                })
                this.$emit('results', {results: this.results})
                this.loading = false
            },

            /**
             * Select a result
             * @param {Object}
             */
            select (obj) {
                if (!obj) {
                    return
                }
                this.value              = (this.resultsValue && obj[this.resultsValue]) ? obj[this.resultsValue] : obj.id
                this.display            = this.formatDisplay(obj)
                this.selectedDisplay    = this.display

                this.$emit('input', this.value)
                this.$emit('selected', {
                    value: this.value,
                    display: this.display,
                    selectedObject: obj
                })

                this.close()
            },

            /**
             * @param  {Object} obj
             * @return {String}
             */
            formatDisplay (obj) {
                switch (typeof this.resultsDisplay) {
                    case 'function':
                        return this.resultsDisplay(obj)
                    case 'string':
                        if (!obj[this.resultsDisplay]) {
                            throw new Error(`"${this.resultsDisplay}" property expected on result but is not defined.`)
                        }
                        return obj[this.resultsDisplay]
                    default:
                        throw new TypeError()
                }
            },

            /**
             * Register the component as focussed
             */
            focus () {
                this.isFocussed = true
            },

            /**
             * Remove the focussed value
             */
            blur () {
                this.isFocussed = false
            },

            /**
             * Is this item selected?
             * @param {Object}
             * @return {Boolean}
             */
            isSelected (key) {
                return key === this.selectedIndex
            },

            /**
             * Focus on the previous results item
             */
            up () {
                if (this.selectedIndex === null) {
                    this.selectedIndex = this.results.length - 1
                    return
                }
                this.selectedIndex = (this.selectedIndex === 0) ? this.results.length - 1 : this.selectedIndex - 1
            },

            /**
             * Focus on the next results item
             */
            down () {
                if (this.selectedIndex === null) {
                    this.selectedIndex = 0
                    return
                }
                this.selectedIndex = (this.selectedIndex === this.results.length - 1) ? 0 : this.selectedIndex + 1
            },

            /**
             * Select an item via the keyboard
             */
            enter () {
                if (this.selectedIndex === null) {
                    this.value = null;
                    this.$emit('nothing-selected', this.display)
                    return
                }
                this.select(this.results[this.selectedIndex])
                this.$emit('enter', this.display)
            },

            /**
             * Clear all values, results and errors
             */
            clear () {
                this.display = null
                this.value = null
                this.results = null
                this.error = null
                this.$emit('input', null)
                this.$emit('clear')
            },

            /**
             * Close the results list.
             */
            close () {
                if (!this.value || !this.selectedDisplay) {
                    //this.clear()
                    this.value  = this.copyDisplay ? this.display : null;
                    this.$emit('nothing-selected', this.display)
                }

                if (this.selectedDisplay !== this.display && this.value) {
                    this.value  = this.copyDisplay ? this.display : null;;
                }

                //if (this.selectedDisplay !== this.display && this.value) {
                //    this.display = this.selectedDisplay
                //}

                this.results = null
                this.error = null
                this.removeEventListener()
                this.$emit('close', this.display)
                this.$emit('input', this.value)
            },

            /**
             * Add event listener for clicks outside the results
             */
            setEventListener () {
                if (this.eventListener) {
                    return false
                }
                this.eventListener = true
                document.addEventListener('click', this.clickOutsideListener, true)
                return true
            },

            /**
             * Remove the click event listener
             */
            removeEventListener () {
                this.eventListener = false
                document.removeEventListener('click', this.clickOutsideListener, true)
            },

            /**
             * Method invoked by the event listener
             */
            clickOutsideListener (event) {
                if (this.$el && !this.$el.contains(event.target)) {
                    this.close()
                }
            }
        },
        mounted () {
            this.value              = this.initialValue
            this.display            = this.initialDisplay
            this.selectedDisplay    = this.initialDisplay

            this.position = $(this.$el).position();
        }
    }
</script>

<style lang="scss">
    .sko-aut {
        //position: relative;
        width: 100%;
        * {
            box-sizing: border-box;
        }
    }

    .sko-aut-box {
        display: flex;
        align-items: center;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 0 5px;
    }

    .sko-aut-searching {
        border-radius: 3px 3px 0 0;
    }

    .sko-aut-inputs {
        flex-grow: 1;
        padding: 0px 5px;
        input {
            border: none;
            width: 100% !important;
        }
        input:focus {
            outline: none;
        }
    }

    .sko-aut-results {
        background: white;
        border: 1px solid #ccc;
        border-top: 0px;
        color: black;
        list-style-type: none;
        margin: 0px; //8px 0px 0px -6px;
        max-height: 400px;
        overflow-y: auto;
        padding: 0px;
        position: absolute;
        width: 100%; //auto;
        z-index: 1000;
    }

    .sko-aut-results-item-error {
        color: red;
    }

    .sko-aut-results-item {
        padding: 7px 10px;
        cursor: pointer;
    }
    .sko-aut-results-item:hover {
        background: rgba(0, 180, 255, 0.075);
    }
    .sko-aut-selected {
        background: rgba(0, 180, 255, 0.15);
    }

    .sko-aut-icon {
        height: 14px;
        width: 14px;
    }
    .sko-aut-box .sko-aut-icon.sko-aut-clear {
        margin-top: -7px;
    }

    .sko-aut-animate-spin {
        animation: spin 2s infinite linear;
    }
</style>