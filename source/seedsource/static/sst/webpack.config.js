var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    context: __dirname,

    entry: './js/index',

    output: {
        path: path.resolve('./bundles/'),
        filename: '[name].js'
    },

    plugins: [
        new BundleTracker({filename: './webpack-stats.json'})
    ],

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: path.resolve('./js'),
                loader: 'babel'
            }
        ]
    },

    resolve: {
        modulesDirectories: ['node_modules', 'bower_componenets'],
        extensions: ['', '.js', '.jsx']
    }
}
