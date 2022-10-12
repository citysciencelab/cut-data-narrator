module.exports = function (api) {
    const isTest = api.env("unitTest"),
        presets = [
            [
                "@babel/preset-env", {
                    "useBuiltIns": "entry",
                    "corejs": {
                        "version": 3
                    },
                    "targets": {
                        "browsers": ["defaults"]
                    }
                }
            ]
        ],
        plugins = ["@babel/plugin-syntax-dynamic-import"];

    if (isTest) {
        plugins.push(
            "@babel/plugin-transform-modules-commonjs"
        );
    }
    api.cache(false);

    return {
        exclude: /vuetify/,
        presets,
        plugins
    };
};
