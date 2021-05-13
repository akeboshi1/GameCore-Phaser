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
const CircularDependencyPlugin = require("circular-dependency-plugin");
const appVer = require("./version");

// const resourcesOut = { name: "[name]_[hash].[ext]", outputPath: "resources" };
const commonConfig = {
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            phaser: phaser,
            webworkerrpc: webworkerrpc,
            "dragonbones-runtime": path.join(__dirname, "node_modules/dragonbones-runtime/Phaser/3.x/out/dragonBones.js"),
            gamecore: path.join(__dirname, "./src/gamecore/game"),
            gamecoreRender: path.join(__dirname, "./src/gamecore/render"),
            physicalWorker: path.join(__dirname, "./src/gamecore/services"),
            structure: path.join(__dirname, "./src/structure"),
            utils: path.join(__dirname, "./src/utils"),
            editorCanvas: path.join(__dirname, "./src/editor"),
            display: path.join(__dirname, "./src/base/render/display"),
            baseRender: path.join(__dirname, "./src/base/render"),
            baseGame: path.join(__dirname, "./src/base/game"),
            resources: path.join(__dirname, "./resources")
        },
    },
    optimization: {
        minimize: false,
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
        })
    ]
};

// TODO webpack 5 https://webpack.js.org/guides/asset-modules/ 将取代file-loader raw-loader
const gameConfig = Object.assign({}, commonConfig, {
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", options: { allowTsInNodeModules: false }, exclude: "/node_modules/" },
            { test: /webworkerrpc\.js$/, loader: "expose-loader?webworker-rpc" },
            // { test: /\.(gif|png|dbbin|ttf|jpe?g|svg|mp3|mp4|xml)$/i, loader: "file-loader", options: resourcesOut },
            // { test: /\.json/, type: "javascript/auto", loader: "file-loader", exclude: "/resources/locales/", options: resourcesOut },
        ],
    },
    externals: { "dragonbones-runtime": "dragonbones-runtime", tooqinggamephaser: "tooqinggamephaser" },
    entry: {
        index: "./src/index.ts",
        baseGame: "./src/base/game/index.ts",
        baseRender: "./src/base/render/index.ts",
        editor: "./src/editor/index.ts",
        utils: "./src/utils/index.ts",
        structure: "./src/structure/index.ts",
        renderPeer: "./src/gamecore/render/index.ts",
        mainPeer: "./src/gamecore/game/index.ts",
        physicalPeer: "./src/gamecore/services/index.ts"
    },
    output: {
        // This is required so workers are known where to be loaded from
        path: path.resolve(__dirname, "dist"),
        filename: "js/[name].js",
        chunkFilename: `js/[name].js`,
        libraryTarget: "umd",
        globalObject: "this",
        library: "[name]",
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: "**/*", to: `resources`, toType: "dir"
            , force: true, context: "resources"
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
        new CircularDependencyPlugin({
            // exclude detection of files based on a RegExp
            exclude: /a\.js|node_modules/,
            // include specific files based on a RegExp
            include: /src/,
            // add errors to webpack instead of warnings
            failOnError: true,
            // allow import cycles that include an asyncronous import,
            // e.g. via import(/* webpackMode: "weak" */ './file.js')
            allowAsyncCycles: false,
            // set the current working directory for displaying module paths
            cwd: process.cwd(),
        })
    ],
    devServer: {
        writeToDisk: true,
        // watchOptions: {
        //     poll: 1000,
        // },
        contentBase: path.resolve(__dirname, "./dist"),
        publicPath: "/dist",
        host: "0.0.0.0",
        port: 8081,
        open: false,
    },
});

module.exports = [
    gameConfig
];
