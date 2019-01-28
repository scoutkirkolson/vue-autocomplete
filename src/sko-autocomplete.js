import debounce from 'lodash/debounce'

export default {
    //MOUNTED
    mounted () {
        this.value              = this.initialValue
        this.display            = this.initialDisplay
        this.selectedDisplay    = this.initialDisplay

        this.position = this.findPos(this.$el);
        //console.log(this.position);
    }

    //PROPS
    , props: {
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
        containerDisabledClass: {
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
        noResults: {
            type: Boolean,
            default: true
        },

        /**
         * Results message text
         */
        noResultsText: {
            type: String,
            default: 'No results'
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

    //WATCH
    watch: {
        'initialDisplay'    (newValue, oldValue) {
            let that    = this;

            if (!that.display
            ||  !that.value) {
                that.display    = newValue;
            }
        }
    },

    //COMPUTED
    computed: {
        showResults () {
            return Array.isArray(this.results) || this.hasError
        },
        emptyResults () {
            return Array.isArray(this.results) && this.results.length === 0
        },
        noResultMessage () {
            return this.emptyResults &&
                !this.isLoading &&
                this.isFocussed &&
                !this.hasError &&
                this.noResults
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

    //METHODS
    methods: {
        /**
         * Search wrapper method
         */
        search () {
            this.$emit('update:displayValue', this.display);
            this.selectedIndex = null
            switch (true) {
                case typeof this.source === 'string':
                    // No resource search with no input
                    if (!this.display || this.display.length < this.minSearchLength ) {
                        return
                    }
                    return this.resourceSearch(this.source + this.display)

                case typeof this.source === 'function':
                    // No resource search with no input
                    if (!this.display || this.display.length < this.minSearchLength ) {
                        return
                    }
                    return this.resourceSearch(this.source(this.display, this.sourceparams))

                case Array.isArray(this.source):
                    return this.arrayLikeSearch()

                default:
                    throw new TypeError()
            }
        },

        /**
         * Debounce the typed search query before making http requests
         * @param {String} url
         */
        resourceSearch: debounce(function (url) {
            if (!this.display) {
                this.results = []
                return
            }
            this.loading = true
            this.setEventListener()
            this.request(url)
        }, 200),

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
            this.$emit('update:displayValue', this.display);
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
        },

        findPos (obj) {
            var
                curleft = 0,
                curtop = 0;

            if (obj.offsetParent)
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;

            } while (obj = obj.offsetParent);

            return [curleft,curtop];
        }
    },

}
