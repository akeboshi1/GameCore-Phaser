const path = require("path");
const webpack = require("webpack");
const pathToPhaser = path.join(__dirname, "/node_modules/tooqinggamephaser");
const phaser = path.join(pathToPhaser, "dist/phaser.js");
const pathToRPC = path.join(__dirname, "/node_modules/webworker-rpc");
const webworkerrpc = path.join(pathToRPC, "release/rpcpeer.js")
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TSLintPlugin = require("tslint-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const appVer = require("./version");

const resourcesOut = { name: "[name]_[hash].[ext]", outputPath: "resources" };
const commonConfig = {
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            phaser: phaser,
            webworkerrpc: webworkerrpc,
            dragonBones: path.join(__dirname, "./lib/dragonBones/dragonBones.js"),
            gamecore: path.join(__dirname, "./src/game"),
            gamecoreRender: path.join(__dirname, "./src/render"),
            structure: path.join(__dirname, "./src/structure"),
            utils: path.join(__dirname, "./src/utils"),
            picaWorker: path.join(__dirname, "./src/pica/game"),
            picaRender: path.join(__dirname, "./src/pica/render"),
            picaRes: path.join(__dirname, "./src/pica/res"),
            picaStructure: path.join(__dirname, "./src/pica/structure"),
            editorCanvas: path.join(__dirname, "./src/editor"),
            display: path.join(__dirname, "./src/base/display"),
            baseRender: path.join(__dirname, "./src/base/render"),
            baseModel: path.join(__dirname, "./src/base/model"),
            resources: path.join(__dirname, "./resources")
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
        new TSLintPlugin({
            config: path.resolve(__dirname, "./tslint.json"),
            files: ["./src/**/*.ts"],
        }),
    ]
};

// TODO webpack 5 https://webpack.js.org/guides/asset-modules/ 将取代file-loader raw-loader
const gameConfig = Object.assign({}, commonConfig, {
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", options: { allowTsInNodeModules: false }, exclude: "/node_modules/" },
            { test: /phaser\.js$/, loader: "expose-loader?Phaser" },
            { test: /dragonBones\.js$/, loader: "expose-loader?dragonBones" },
            { test: /webworkerrpc\.js$/, loader: "expose-loader?webworker-rpc" },
            { test: /\.(gif|png|dbbin|ttf|jpe?g|svg|mp3|mp4|xml)$/i, loader: "file-loader", options: resourcesOut },
            { test: /\.json/, type: "javascript/auto", loader: "file-loader", exclude: "/resources/locales/", options: resourcesOut },
        ],
    },
    entry: {
        tooqing: path.join(__dirname, "./launcher.ts"),
        editor: path.join(__dirname, "./src/editor/index.ts"),
    },
    output: {
        // This is required so workers are known where to be loaded from
        path: path.resolve(__dirname, "dist"),
        filename: "js/[name].js",
        chunkFilename: `js/[name]_v${appVer}.js`,
        libraryTarget: "umd",
        globalObject: "this",
        library: "[name]",
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: "./resources/locales", to: `resources/locales`, toType: "dir"
            , force: true
        },
        {
            from: "./resources/scripts", to: `resources/scripts`, toType: "dir"
            , force: true
        }]),
        new HtmlWebpackPlugin({
            inject: "head",
            title: "图轻播放器",
            template: path.join(__dirname, "./index.html"),
            chunks: ["tooqing"]
        }),
        new webpack.DefinePlugin({
            WEBGL_RENDERER: true, // I did this to make webpack work, but I"m not really sure it should always be true
            CANVAS_RENDERER: true, // I did this to make webpack work, but I"m not really sure it should always be true
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
});



const workerConfig = Object.assign({}, commonConfig, {
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", options: { allowTsInNodeModules: false }, exclude: "/node_modules/" },
            { test: /webworkerrpc\.js$/, loader: "expose-loader?webworker-rpc" },
            { test: /\.(gif|png|dbbin|ttf|jpe?g|svg|mp3|mp4|xml)$/i, loader: "file-loader", options: resourcesOut },
            { test: /\.json/, type: "javascript/auto", loader: "file-loader", exclude: "/resources/locales/", options: resourcesOut },
        ],
    },
    entry: {
        mainWorker: path.join(__dirname, "./src/game/main.peer.ts"),
        physicalWorker: path.join(__dirname, "./src/services/physical.worker.ts")
    },
    output: {
        // This is required so workers are known where to be loaded from
        path: path.resolve(__dirname, "dist"),
        filename: `js/[name]_v${appVer}.js`,
        libraryTarget: "umd",
        globalObject: "this",
        library: "[name]",
    },
});
module.exports = [
    gameConfig, workerConfig
];
