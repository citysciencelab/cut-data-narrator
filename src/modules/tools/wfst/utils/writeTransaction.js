import {WFS} from "ol/format";

const transactionPosition = {
    insert: 0,
    selectedUpdate: 1,
    delete: 2
};

/**
 * Writes a wfs transaction including the given feature for given layer
 * inserting, updated or deleting the feature depending on the given selectedInteraction.
 *
 * @param {module:ol/Feature} feature Feature to be inserted, updated or deleted.
 * @param {TransactionLayer} layerInformation Information about the layer to be manipulated.
 * @param {("insert"|"delete"|"selectedUpdate")} transactionMethod Which transaction to perform.
 * @param {String} srsName EPSG code currently used by the map.
 * @returns {String} WFS Transaction as an XML String.
 */
function writeTransaction (feature, layerInformation, transactionMethod, srsName) {
    const {featureNS, featurePrefix, featureType, version} = layerInformation,
        transaction = [[], [], []];

    transaction[transactionPosition[transactionMethod]].push(feature);
    return new XMLSerializer()
        .serializeToString(
            new WFS({version})
                .writeTransaction(...transaction, {
                    featureNS,
                    featurePrefix,
                    featureType,
                    version,
                    srsName
                })
        );
}

export default {writeTransaction};
