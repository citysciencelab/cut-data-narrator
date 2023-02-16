const Config = {
    addons: ["dataNarrator"],
    vuetify: "addons/dipasAddons/dataNarrator/vuetify",
    storyConf: "./assets/story.json",
    uiStyle: "table",
    namedProjections: [
        ['EPSG:25833',
            '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs']
    ],
    footer: {
        urls: [
            {
                "bezeichnung": "common:modules.footer.designation",
                "url": "https://geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV"
            }
        ],
        showVersion: true
    },
    layerConf: "./assets/services-internet.json",
    scaleLine: true,
};

// conditional export to make config readable by e2e tests
if (typeof module !== "undefined") {
    module.exports = Config;
}
