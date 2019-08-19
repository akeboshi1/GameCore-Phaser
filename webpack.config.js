const path = require('path');
const pathToPhaser = path.join(__dirname, '/node_modules/phaser');
const phaser = path.join(pathToPhaser, 'dist/phaser.js');
//const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ConfigWebpackPlugin = require("config-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        launcher: path.join(__dirname, "./launcher.ts"),
        worker: path.join(__dirname, 'src/net/networker.ts'),
    },
    output: {
        path: path.join(__dirname, 'dist/'),
        filename: "[name].js",
        chunkFilename: "[hash].[name].js"
    },
    devtool: "source-map",
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' },
            { test: /phaser\.js$/, loader: 'expose-loader?Phaser' },
            { test: /dragonBones\.js$/, loader: 'expose-loader?dragonBones' },
        ],
    },
    plugins: [
        new ConfigWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "图轻播放器",
            template: path.join(__dirname, "index.html")
        }),
        new CopyWebpackPlugin([
            { from: "resources", to: "./resources" }
        ])
        // new UglifyJSPlugin({
        //     parallel: true,
        //     uglifyOptions: {
        //         output: {
        //             comments: false,
        //             beautify: false,
        //         },
        //         compress: true,
        //     },
        //     cache: true,
        // })

    ],
    devServer: {
        contentBase: path.resolve(__dirname, './dist'),
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
