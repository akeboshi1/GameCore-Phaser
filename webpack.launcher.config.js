const path = require("path");
const webpack = require("webpack");
const ConfigWebpackPlugin = require("config-webpack");
const TSLintPlugin = require("tslint-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const config = {
    entry: {
        tooqing: path.join(__dirname, "./src/launcher.ts"),
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "js/[name].js",
        libraryTarget: "umd",
        globalObject: "this",
        library: "TooqingLauncher",
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", exclude: "/node_modules/" },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"]
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
        new ConfigWebpackPlugin(),
       
        new TSLintPlugin({
            config: path.resolve(__dirname, "./tslint.json"),
            files: ["./src/**/*.ts"],
        }),
        new webpack.DefinePlugin({
            WEBGL_RENDERER: true, // I did this to make webpack work, but I'm not really sure it should always be true
            CANVAS_RENDERER: true, // I did this to make webpack work, but I'm not really sure it should always be true
        }),
    ]
};
module.exports = (env, argv) => {
    return config;
};
