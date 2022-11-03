import receivePossibleProperties from "./receivePossibleProperties";

/**
 * Prepares the possible feature properties to be set for
 * a DescribeFeatureType request and joins this together
 * with the gfiAttributes configuration of the layer.
 *
 * @param {TransactionLayer} layer Layer to retrieve information for.
 * @param {Boolean} useProxy Whether a proxy should be used for requests. Deprecated in v3.0.0.
 * @returns {FeatureProperty[]} If layer.gfiAttributes !== "ignore", then an array of prepared feature properties; else and empty array.
 */
async function prepareFeatureProperties (layer, useProxy) {
    if (layer.gfiAttributes === "ignore") {
        return [];
    }
    const properties = await receivePossibleProperties(layer, useProxy);

    return layer.gfiAttributes === "showAll"
        ? properties
        : properties
            .reduce((array, property) => layer.gfiAttributes[property.key] !== undefined
                ? [...array, {...property, label: layer.gfiAttributes[property.key]}]
                : array,
            [properties.find(({type}) => type === "geometry")]);
}

module.exports = {prepareFeatureProperties};
