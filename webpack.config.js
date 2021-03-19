// Template for webpack.config.js in Fable projects
// Find latest version in https://github.com/fable-compiler/webpack-config-template

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
    indexHtmlTemplate: "./src/index.html",
    appEntry: "./build/App.js",
    cssEntry: "./sass/main.sass",
    outputDir: "./deploy",
    assetsDir: "./public",
    publicPath: '/',
    devServerPort: 8080,
    devServerProxy: undefined,
    babel: {
        presets: [
            ["@babel/preset-env", {
                "modules": false,
                // This adds polyfills when needed. Requires core-js dependency.
                // See https://babeljs.io/docs/en/babel-preset-env#usebuiltins
                "useBuiltIns": "usage",
                "corejs": 3
            }]
        ],
    }
}

const isProduction = !hasArg("serve");
console.log(`Bundling for ${isProduction ? "production" : "development"}...`);

const commonPlugins = [
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: resolve(config.indexHtmlTemplate)
    })
];

module.exports = {
    entry: isProduction ? {
        app: [resolve(config.appEntry), resolve(config.cssEntry)]
    } : {
            app: [resolve(config.appEntry)],
            style: [resolve(config.cssEntry)]
        },
    output: {
        publicPath: config.publicPath,
        path: resolve(config.outputDir),
        filename: isProduction ? '[name].[contenthash].js' : '[name].js'
    },
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-source-map",
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
    },
    plugins: isProduction ?
        commonPlugins.concat([
            new MiniCssExtractPlugin({ filename: 'style.[contenthash].css' }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: resolve(config.assetsDir) }
                ]
            }),
        ])
        : commonPlugins.concat([
            new webpack.HotModuleReplacementPlugin(),
        ]),
    resolve: {
        // See https://github.com/fable-compiler/Fable/issues/1490
        symlinks: false
    },
    devServer: {
        historyApiFallback: {
            index: '/'
        },
        publicPath: config.publicPath,
        contentBase: resolve(config.assetsDir),
        host: '0.0.0.0',
        port: config.devServerPort,
        proxy: config.devServerProxy,
        hot: true,
        inline: true
    },
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     exclude: /node_modules/,
            //     use: {
            //         loader: 'babel-loader',
            //         options: config.babel
            //     },
            // },
            {
                test: /\.(sass|scss|css)$/,
                use: [
                    isProduction
                        ? MiniCssExtractPlugin.loader
                        : 'style-loader',
                    'css-loader',
                    'resolve-url-loader',
                    {
                      loader: 'sass-loader',
                      options: { implementation: require("sass") }
                    }
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*)?$/,
                use: ["file-loader"]
            }
        ]
    }
};

function resolve(filePath) {
    return path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
}

function hasArg(arg) {
    return arg instanceof RegExp
        ? process.argv.some(x => arg.test(x))
        : process.argv.indexOf(arg) !== -1;
}
