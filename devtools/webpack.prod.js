const merge = require("webpack-merge"),
    Common = require("./webpack.common.js"),
    {ESBuildMinifyPlugin} = require("esbuild-loader"),
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
                },
                // take all files ending with ".js" but not with ".test.js" or ".spec.js".
                {
                    test: /\.js$/,
                    exclude: /\.(test|spec)\.js$/,
                    use: {
                        loader: "esbuild-loader",
                        options: {
                            loader: "js",
                            target: "es2015",
                            format: "cjs", // commonjs
                            platform: "node"
                        }
                    }
                }
            ]
        },
        optimization: {
            minimize: true,
            minimizer: [new ESBuildMinifyPlugin({
                css: true // Apply minification to CSS assets additional to minify js-code
            })]
        },
        stats: {
            "children": false,
            "errorDetails": true
        }
    });
};
