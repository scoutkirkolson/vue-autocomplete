<template>
    <div class="sko-aut">
        <!-- container -->
        <div
            class   = "sko-aut-box"
            :class  = "[
                containerClass
                , disableInput ? containerDisabledClass : ''
                , showResults ? 'sko-aut-searching' : ''
            ]"
        >
            <!-- search icon -->
            <span
                class   = "sko-aut-icon sko-aut-icon-search"
                @click  = "search"
                v-if    = "searchButton"
            >
                <img v-if="!isLoading" src="./assets/search.svg">
                <img v-else class="sko-aut-icon sko-aut-animate-spin" src="./assets/loading.svg">
            </span>

            <!-- search input -->
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
                />
                <input :name="name" type="hidden" :value="value || initialValue" />
                <input :name="nameDisplay" type="hidden" :value="display || initialDisplay"  />
            </div>

            <!-- clear icon -->
            <span
                class   = "sko-aut-icon sko-aut-icon-clear"
                @click  = "clear"
                v-show  = "clearButton && !disableInput && !isEmpty && !isLoading && !hasError"
            >
                <span v-if="clearButtonIcon" :class="clearButtonIcon"></span>
                <img v-else src="./assets/close.svg">
            </span>
        </div>

        <!-- search results -->
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
                <li v-if="noResultMessage" class="sko-aut-results-item sko-aut-results-none">
                    <slot name="noResults">{{ noResultsText }}</slot>
                </li>
            </slot>
        </ul>
    </div>
</template>

<script src="./sko-autocomplete.js">
</script>

<style lang="scss" src="./sko-autocomplete.scss" scoped>
</style>

