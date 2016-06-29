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
        loaders: [
            {
                test: /\.jsx?$/,
                include: path.resolve('./assets'),
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },

    resolve: {
        modulesDirectories: ['node_modules', 'bower_componenets'],
        extensions: ['', '.js', '.jsx']
    }
}
