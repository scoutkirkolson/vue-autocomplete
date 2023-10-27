var path = require('path')
var webpack = require('webpack')
var urloader = require('url-loader')

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    entry: './src/sko-autocomplete.vue',
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'sko-autocomplete.js',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                }
            },
            {
                test: /\.css$/,
                loader: "css-loader"
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)(\?.*)?$/,
                use: [
                    'url-loader?name=assets/[name].[ext]',
                ]
            },
        ]

    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
            , 'assets': path.resolve(__dirname, '../src/assets')
        }
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    performance: {
        hints: false
    },
    mode: 'development',
};


if (process.env.NODE_ENV === 'production') {
    module.exports.mode = 'production'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new VueLoaderPlugin(),
        new UglifyJsPlugin({
            sourceMap:true
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
} else{
    module.exports.plugins = (module.exports.plugins || []).concat([
        new VueLoaderPlugin(),
    ])
}
