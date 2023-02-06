const resultsLayerId = "111113";
let mapper = [];
let selectedId = null;
let resultsLayer = null;

waitForElm("#map").then((elm) => {
    mapper = mapCollection.getMap("2D");
    mapper.on("loadend", function (e) {
        resultsLayer = getLayerById(resultsLayerId);
    });

    mapper.on('singleclick', function (e) {
        if (isTouchDevice()) {
            actionOnClickAndHover(e);
        }
    });

    mapper.on("pointermove", function (e) {
        if (!isTouchDevice()) {
            actionOnClickAndHover(e);
        }
    });
});

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

function actionOnClickAndHover(e) {

    if (resultsLayer) {
        if (selectedId !== null) {
            for (const feature of resultsLayer.getSource().getFeatures()) {
                if (feature.values_.featureId === selectedId) {
                    if (feature.values_.hasOwnProperty("transparent") && feature.values_.transparent) {
                        feature.setProperties({transparent: false});
                    } else {
                        feature.setProperties({hidden: true});
                    }
                }
                // Just to make sure everything thats not point is hidden in the end
                if (feature.values_.geometry.constructor.name !== 'Point'
                    && feature.values_.hasOwnProperty("hidden") && !feature.values_.hidden) {
                    feature.setProperties({hidden: true});
                }
            }
        }
        mapper.forEachFeatureAtPixel(e.pixel, featureHover);
    } else {
        resultsLayer = getLayerById(resultsLayerId);
    }
}


function featureHover(f) {
    const featureId = f.values_.featureId

    let featureCount = 0;
    for (const feature of resultsLayer.getSource().getFeatures()) {
        if (feature.values_.featureId === featureId) {
            featureCount++;
        }
    }

    if (featureCount == 2) {
        selectedId = featureId
        if (!f.values_.hasOwnProperty("hoverCircle")) {
            for (const feature of resultsLayer.getSource().getFeatures()) {
                if (feature.values_.featureId === featureId
                    && feature.values_.hasOwnProperty("hoverCircle")) {
                    feature.setProperties({transparent: true});
                }
            }
            f.setProperties({hidden: false});
            return true;
        } else {
            for (const feature of resultsLayer.getSource().getFeatures()) {
                if (feature.values_.featureId === featureId
                    && feature.values_.hasOwnProperty("hidden")
                    && feature.values_.hidden) {
                    feature.setProperties({hidden: false});
                }
            }
            f.setProperties({transparent: true});
            return true;
        }
    }
}


function getLayerById(layerId) {
    const layers = mapper.getLayers();
    for (const layer of layers.array_) {
        if (layer.values_.id === layerId) {
            return layer;
        }
    }
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
