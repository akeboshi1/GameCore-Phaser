const path = require('path');
const pathToPhaser = path.join(__dirname, '/node_modules/phaser');
const phaser = path.join(pathToPhaser, 'dist/phaser.js');
const ConfigWebpackPlugin = require("config-webpack");

module.exports = {
    entry: {
        launcher: path.join(__dirname, 'launcher.ts'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: "source-map",
    module: {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/'},
            {test: /phaser\.js$/, loader: 'expose-loader?Phaser'},
            {test: /dragonBones\.js$/, loader: 'expose-loader?dragonBones'},
        ],
    },
    plugins: [
        new ConfigWebpackPlugin("StaticConfig")
    ],
    devServer: {
        contentBase: path.resolve(__dirname, './'),
        publicPath: '/dist/',
        host: '127.0.0.1',
        port: 8081,
        open: false
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            phaser: phaser,
            dragonBones: path.join(__dirname, "./lib/dragonBones/dragonBones.js")
        }
    }
};
