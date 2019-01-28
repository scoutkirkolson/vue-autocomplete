# SkoAutocomplete
Vue-based Form input element with autocompletion options.

**Works with Vue 2.***

## Demo
See live demo on [Live Demo](https://scoutkirkolson.github.io/vue-autocomplete/)

## Requirements

- [Vue.js](https://github.com/vuejs/vue) `^2.0.0` 
- [Bootstrap](https://getbootstrap.com/) `^4.0` (Optional)

## Installation
`npm install scoutkirkolson/vue-autocomplete --save`

## Usage

Install component using npm, add autocomplete component into your app

```javascript
import Vue from 'vue'
import skoAutocomplete from 'sko-autocomplete'

new Vue({
  //...
  components: {
    skoAutocomplete,
  },
  //...
})
```

``` html
<sko-autocomplete
   source          = "http://mywebsite/sources.json"
   v-model         = "agreement_id"
>
</sko-autocomplete>
```

## Props
|Props|Description|Required|Type|Default|
|-----|-----------|--------|----|-------|
|disabled|Disable input|false|Boolean|false|

## License

Sko-Autocomplete is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)

## Support
Hello, I'm Kirk the maintainer of this project in my free time (which is getting lessen these days), if this project does help you in any way please consider to support me. Thanks :smiley:
- [One-time donation via Paypal](https://www.paypal.me/kirkolson
