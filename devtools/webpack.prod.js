const merge = require("webpack-merge"),
    Common = require("./webpack.common.js"),
    UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
    { ESBuildMinifyPlugin } = require("esbuild-loader"),
    TerserPlugin = require("terser-webpack-plugin"),
    path = require("path"),

    rootPath = path.resolve(__dirname, "../"),
    mastercodeVersionFolderName = require(path.resolve(rootPath, "devtools/tasks/getMastercodeVersionFolderName"))();

module.exports = function () {
    return merge.smart(new Common(), {
        mode: "production",
        output: {
            path: path.resolve(__dirname, "../dist/build"),
            filename: "js/[name].js",
            publicPath: "../mastercode/" + mastercodeVersionFolderName + "/"
        },
        module: {
            rules: [
                // alle Schriftarten (auch die Bootstrap-Icons) kommen in lokalen Ordner
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "css/woffs/",
                        publicPath: "./woffs/"
                    }
                }
            ]
        },
        // ohne optimization: baut ohne Fehler, aber beim Browserstart in der console:Uncaught SyntaxError: Identifier 'exports' has already been declared (at masterportal.js:30315:7)
        // optimization: {
        //     minimize: true, //-> alleine: baut ohne Fehler, aber beim Browserstart in der console:Uncaught SyntaxError: Identifier 'exports' has already been declared (at masterportal.js:30315:7)
            // minimizer: [new UglifyJsPlugin({
                // *** use this attribute to build masterportal.js without uglify ***
                // include: /\.min\.js$/
                // --> baut ohne Fehler, aber beim Browserstart in der console: Uncaught SyntaxError: Identifier 't' has already been declared
            // })]
            // minimizer: [new ESBuildMinifyPlugin({
            //     target: "es2015", // Syntax to compile to (see options below for possible values)
            //     format: "cjs",
            //     platform: "node",
                // format: 'iife',
                // exclude: /\bolcs\b/
                // format: 'iife' alleine oder auch mit cjs und node --> 'Error: Transform failed with 2 errors:\n' +
                            // 'js/masterportal.js:30315:6: ERROR: The symbol "exports" has already been declared\n' +
                            // 'js/masterportal.js:45528:6: ERROR: The symbol "exports" has already been declared\n' +

            //   })]
            // minimizer: [ new TerserPlugin({
            //     minify: TerserPlugin.esbuildMinify,
                // `terserOptions` options will be passed to `esbuild`
                // Link to options - https://esbuild.github.io/api/#minify
                // Note: the `minify` options is true by default (and override other `minify*` options), so if you want to disable the `minifyIdentifiers` option (or other `minify*` options) please use:
                // terserOptions: {
                //   minify: false,
                //   minifyWhitespace: true,
                //   minifyIdentifiers: false,
                //   minifySyntax: true,
                // },
            //     terserOptions: {}
            //   }),
            //  --> auch der exports fehler
            // ]
            //   runtimeChunk: true // --> soll angeblich duplicated... wegmachen, funktioniert nicht
        // },
        stats: {
            "children": false,
            "errorDetails": true
        }
    });
};
