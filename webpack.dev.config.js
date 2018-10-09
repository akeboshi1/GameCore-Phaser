var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
// var WebpackSynchronizableShellPlugin = require('webpack-synchronizable-shell-plugin');

module.exports = {
    entry:  './Game.ts',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'game-bundle.js'
    },
    target: "web",
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
            phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
            p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'DEV MODE: Phaser NPM Webpack TypeScript Starter Project!',
            template: path.join(__dirname, 'index.ejs')
        })
    ],

    module: {
        rules: [
            // {test: /\.ts$/, enforce: 'pre', loader: 'tslint-loader'},
            {test: /pixi\.js$/, loader: 'expose-loader?PIXI'},
            {test: /phaser-split\.js$/, loader: 'expose-loader?Phaser'},
            {test: /p2\.js$/, loader: 'expose-loader?p2'},
            {test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/'}
        ]
    },
    devtool: 'source-map'
};
