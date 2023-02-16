const Config = {
    addons: ["dataNarrator"],
    ignoredKeys: [
        "BOUNDEDBY",
        "SHAPE",
        "SHAPE_LENGTH",
        "SHAPE_AREA",
        "OBJECTID",
        "GLOBALID",
        "GEOMETRY",
        "SHP",
        "SHP_AREA",
        "SHP_LENGTH",
        "GEOM"
    ],
    wfsImgPath: "https://geodienste.hamburg.de/lgv-config/img/",
    vuetify: "addons/dipasAddons/dataNarrator/vuetify",
    metadata: {
        useProxy: ["https://metaver.de/csw"]
    },
    tree: {
        orderBy: "opendata",
        saveSelection: true
    },
    scaleLine: true,
    quickHelp: {
        imgPath: "https://geodienste.hamburg.de/lgv-config/img/"
    },
    allowParametricURL: true,
    view: {
        center: [565874, 5934140]
    },
    namedProjections: [
        // GK DHDN
        [
            "EPSG:31467",
            "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"
        ],
        // ETRS89 UTM
        [
            "EPSG:25832",
            "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
        ],
        // LS 320: zusammen mit Detlef Koch eingepflegt und geprüft
        [
            "EPSG:8395",
            "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"
        ],
        // WGS84
        [
            "EPSG:4326",
            "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
        ]
    ],
    layerConf: "./assets/services-internet.json",
    uiStyle: "table",
    styleConf: "https://raw.githubusercontent.com/herzogrh/faircare-verkehr/main/assets/data/style.json",
    storyConf: "./assets/story-3d.json",
    isMenubarVisible: true,
    gemarkungen: "https://geodienste.hamburg.de/lgv-config/gemarkung.json",
    obliqueMap: true,
    cesiumParameter: {
        tileCacheSize: 20,
        enableLighting: true,
        fog: {
            enabled: true,
            density: 0.0002,
            screenSpaceErrorFactor: 2.0
        },
        maximumScreenSpaceError: 2,
        fxaa: true
    },
    startingMap3D: false,
    portalLanguage: {
        enabled: true,
        debug: false,
        languages: {
            de: "deutsch",
            en: "englisch"
        },
        fallbackLanguage: "de",
        changeLanguageOnStartWhen: ["querystring", "localStorage", "htmlTag"]
    }
};

// conditional export to make config readable by e2e tests
if (typeof module !== "undefined") {
    module.exports = Config;
}
