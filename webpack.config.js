const path = require("path");
const webpack = require("webpack");
const pathToPhaser = path.join(__dirname, "/node_modules/phaser");
const phaser = path.join(pathToPhaser, "dist/phaser.js");
const ConfigWebpackPlugin = require("config-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TSLintPlugin = require("tslint-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const appVer = require("./version");

const config = {
    entry: {
        tooqing: path.join(__dirname, "./launcher.ts"),
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "js/[name].js",
        chunkFilename: `js/[name]_v${appVer}.js`,
        libraryTarget: "umd",
        globalObject: "this",
        library: "TooqingCore",
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", exclude: "/node_modules/" },
            { test: /phaser\.js$/, loader: "expose-loader?Phaser" },
            { test: /dragonBones\.js$/, loader: "expose-loader?dragonBones" },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            phaser: phaser,
            dragonBones: path.join(__dirname, "./lib/dragonBones/dragonBones.js"),
        },
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
                terserOptions: {
                    ecma: undefined,
                    warnings: false,
                    parse: {},
                    compress: {},
                    mangle: true, // Note `mangle.properties` is `false` by default.
                    module: false,
                    output: null,
                    toplevel: false,
                    nameCache: null,
                    ie8: false,
                    keep_classnames: true,
                    keep_fnames: true,
                    safari10: false,
                },
            }),
        ],
    },
    plugins: [
        new CleanWebpackPlugin({
            verbose: true,
            // Automatically remove all unused webpack assets on rebuild
            // default: true
            cleanStaleWebpackAssets: false,
        }),
        new ConfigWebpackPlugin(),
        new CopyWebpackPlugin([{ from: "**/*", to: "resources", force: true, context: "resources" }]),
        new HtmlWebpackPlugin({
            inject: "head",
            title: "图轻播放器",
            template: path.join(__dirname, "./index.html"),
        }),
        new TSLintPlugin({
            config: path.resolve(__dirname, "./tslint.json"),
            files: ["./src/**/*.ts"],
        }),
        new webpack.DefinePlugin({
            WEBGL_RENDERER: true, // I did this to make webpack work, but I'm not really sure it should always be true
            CANVAS_RENDERER: true, // I did this to make webpack work, but I'm not really sure it should always be true
        }),
    ],
    devServer: {
        writeToDisk: true,
        watchOptions: {
            poll: 1000,
        },
        contentBase: path.resolve(__dirname, "./dist"),
        publicPath: "/dist",
        host: "0.0.0.0",
        port: 8081,
        open: false,
    },
};
module.exports = (env, argv) => {
    return config;
};
