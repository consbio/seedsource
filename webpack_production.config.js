var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    devtool: 'cheap-module-source-map',
    context: __dirname,
    entry: './assets/index',

    output: {
        path: path.resolve('./source/seedsource/static/sst/build/'),
        filename: '[name].min.js'
    },

    plugins: [
        new BundleTracker({filename: './webpack-stats.json'}),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true
            },
            comments: false,
            sourceMap: false
        })
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
        modulesDirectories: ['node_modules'],
        extensions: ['', '.js', '.jsx']
    }
}
