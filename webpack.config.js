const path = require("path");
const webpack = require("webpack");
const dragonBonesPath = path.join(__dirname, "/src/base/render/dragonBones/dragonBones.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TSLintPlugin = require("tslint-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const appVer = require("./version");
// 导入速度分析插件
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

// 实例化插件
const smp = new SpeedMeasurePlugin();
// const resourcesOut = { name: "[name]_[hash].[ext]", outputPath: "resources" };
const commonConfig = {
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            dragonBones: dragonBonesPath,
            gamecore: path.join(__dirname, "./src/gamecore/game"),
            gamecoreRender: path.join(__dirname, "./src/gamecore/render"),
            structure: path.join(__dirname, "./src/structure"),
            utils: path.join(__dirname, "./src/utils"),
            editor: path.join(__dirname, "./src/editor"),
            display: path.join(__dirname, "./src/base/render/display"),
            baseRender: path.join(__dirname, "./src/base/render"),
            baseGame: path.join(__dirname, "./src/base/game"),
            resources: path.join(__dirname, "./resources")
        },
    },
    externals: {
        "webworker-rpc": 'webworker-rpc',
        "pixelpai_proto": "pixelpai_proto",
        "phaser3": "phaser3",
        "game-capsule": "game-capsule"
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                sourceMap: false,
                // 设置为true速度最快，自动设置数据处理长度的通道处理
                parallel: true,
                extractComments: false,
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
            { test: /dragonBones\.js$/, loader: "expose-loader?dragonBones" },
        ],
    },
    entry: {
        index: "./src/index.ts",
        baseGame: "./src/base/game/index.ts",
        baseRender: "./src/base/render/index.ts",
        editor: "./src/editor/index.ts",
        utils: "./src/utils/index.ts",
        structure: "./src/structure/index.ts",
        renderPeer: "./src/gamecore/render/index.ts",
        mainPeer: "./src/gamecore/game/index.ts",
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

module.exports = smp.wrap(
    gameConfig
);
