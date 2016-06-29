var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    context: __dirname,

    entry: './src/index',

    output: {
        path: path.resolve('./build/'),
        filename: '[name].js'
    },

    plugins: [
        new BundleTracker({filename: './webpack-stats.json'})
    ],

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: path.resolve('./src'),
                loader: 'babel'
            }
        ]
    },

    resolve: {
        modulesDirectories: ['node_modules', 'bower_componenets'],
        extensions: ['', '.js', '.jsx']
    }
}
