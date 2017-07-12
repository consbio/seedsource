var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    context: __dirname,

    entry: './assets/index',

    output: {
        path: path.resolve('./source/seedsource/static/sst/build/'),
        filename: '[name].js'
    },

    plugins: [
        new BundleTracker({filename: './webpack-stats.json'})
    ],

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: path.resolve('./assets'),
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },

    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.jsx']
    }
}
