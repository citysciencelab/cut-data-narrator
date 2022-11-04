import isObject from "./isObject";

/**
 * implementation of json to csv based on rfc4180
 * @see https://datatracker.ietf.org/doc/html/rfc4180
 * @param {Array[]|Object[]} jsonData an array of String[] (first set could be the header) or an array of Object[] (keys of record with the most fields will be set as header, make sure that all sets have the same order of keys)
 * @param {Function|Boolean} [onerror=false] the error handler to receive errors with as function(error)
 * @param {Boolean} [useSemicolon=false] rfc4180 describes the use of "," - set this to true to use ";" as delimiter instead
 * @param {Boolean} [useLineFeedOnly=false] rfc4180 describes the use of "CRLF" - set this to true to use only "LF" as line ending instead
 * @returns {String|Boolean} the resulting csv data as plain text (string) or false if an error occurred
 */
function convertJsonToCsv (jsonData, onerror = false, useSemicolon = false, useLineFeedOnly = false) {
    if (!Array.isArray(jsonData)) {
        if (typeof onerror === "function") {
            onerror("convertJsonToCsv: the given jsonData shall be an array");
        }
        return false;
    }
    const delimiter = useSemicolon ? ";" : ",",
        eol = useLineFeedOnly ? "\n" : "\r\n",
        organizedJsonData = organizeKeys(jsonData),
        headerRecord = findRecordWithMaxNumberOfFields(organizedJsonData),
        maxNumberOfFields = headerRecord ? Object.keys(headerRecord).length : 0,
        header = !Array.isArray(headerRecord) && typeof headerRecord === "object" && headerRecord !== null ? Object.keys(headerRecord) : false;
    let result = header ? joinRecord(escapeFields(header, delimiter), delimiter, maxNumberOfFields) : "";

    organizedJsonData.forEach(fields => {
        if (typeof fields !== "object" || fields === null) {
            if (typeof onerror === "function") {
                onerror("convertJsonToCsv: a line with an unknown type was found: " + typeof fields);
            }
            return;
        }
        else if (result) {
            result += eol;
        }
        result += joinRecord(escapeFields(Object.values(fields), delimiter), delimiter, maxNumberOfFields);
    });

    return result;
}

/**
 * Runs through the objects of the given array and collects all available keys.
 * Adds missing keys to object clones.
 * @param {Object[]} jsonData an array of objects where keys may miss here and there
 * @returns {Object[]} An array of objects with complete key set in the right order - or the input if anything but an array of objects is given.
 */
function organizeKeys (jsonData) {
    if (!Array.isArray(jsonData) || !isObject(jsonData[0])) {
        return jsonData;
    }
    const result = [],
        keySet = new Set();

    jsonData.forEach(item => {
        if (!isObject(item)) {
            return;
        }
        Object.keys(item).forEach(key => {
            keySet.add(key);
        });
    });
    jsonData.forEach(item => {
        if (!isObject(item)) {
            return;
        }
        const newItem = {};

        keySet.forEach(key => {
            newItem[key] = Object.prototype.hasOwnProperty.call(item, key) ? item[key] : "";
        });
        result.push(newItem);
    });

    return result;
}

/**
 * escapes the values of the given array according to rfc4180
 * rule: escaped = DQUOTE *(TEXTDATA / COMMA / CR / LF / 2DQUOTE) DQUOTE
 * @param {String[]|Number[]} fields an array of values representing one csv line
 * @param {String} delimiter the delimiter to escape as COMMA
 * @returns {String[]} an array of strings without dquotes or with dquotes if something to escape was found in the string
 */
function escapeFields (fields, delimiter) {
    if (typeof fields !== "object" || fields === null) {
        return [];
    }
    const result = [];

    fields.forEach(field => {
        result.push(escapeField(field, delimiter));
    });

    return result;
}

/**
 * escapes the given value according to rfc4180
 * rule: escaped = DQUOTE *(TEXTDATA / COMMA / CR / LF / 2DQUOTE) DQUOTE
 * @param {*} field a value representing a field
 * @param {String} delimiter the delimiter to escape as COMMA
 * @returns {String} the string, may be escaped
 */
function escapeField (field, delimiter) {
    let escaped = false,
        txt = "",
        letter = "";
    const fieldText = String(field),
        len = fieldText.length;

    for (let i = 0; i < len; i++) {
        letter = fieldText[i];

        if (letter === delimiter || letter === "\r" || letter === "\n") {
            escaped = true;
        }
        else if (letter === "\"") {
            escaped = true;
            txt += "\"";
        }

        txt += letter;
    }

    if (escaped) {
        return "\"" + txt + "\"";
    }
    return txt;
}

/**
 * analyses jsonData and returns the record with the most number of fields found
 * @param {Array[]|Object[]} jsonData an array of String[] (first set could be the header) or an array of Object[] (keys of first set is used as header, make sure that all sets have the same keys)
 * @returns {Object|String[]} the record with the most number of fields found in the records
 */
function findRecordWithMaxNumberOfFields (jsonData) {
    if (!Array.isArray(jsonData)) {
        return null;
    }
    let result = null,
        maxNumber = 0;

    jsonData.forEach(record => {
        if (typeof record !== "object" || record === null) {
            return;
        }
        if (maxNumber < Object.keys(record).length) {
            maxNumber = Object.keys(record).length;
            result = record;
        }
    });

    return result;
}

/**
 * joins the given record to a string using the given delimiter, maxes out or down to the given maxNumberOfFields
 * @param {String[]} record the array to join
 * @param {String} delimiter the delimiter to use
 * @param {Number} maxNumberOfFields the number of joined fields
 * @returns {String} the result as joined string
 */
function joinRecord (record, delimiter, maxNumberOfFields) {
    if (!Array.isArray(record)) {
        return "";
    }
    let result = "";

    for (let i = 0; i < maxNumberOfFields; i++) {
        if (i > 0) {
            result += delimiter;
        }
        result += record[i] ? String(record[i]) : "";
    }

    return result;
}

export {
    convertJsonToCsv,
    organizeKeys,
    escapeFields,
    escapeField,
    findRecordWithMaxNumberOfFields,
    joinRecord
};
