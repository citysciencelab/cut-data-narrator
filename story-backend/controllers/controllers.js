const mime = require("mime-types"),
    // usually this file should not be public but hey
    // This info must match the details of a running postgres database. See readme.md for details on DB setup
    Pool = require("pg").Pool,
    pool = new Pool({
        user: "postgres",
        host: "localhost",
        database: "stories",
        password: "hECJFh7",
        port: 5432
    }),
    imagePath = "images/";

/**
 * storing image files on disk
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
const multer = require("multer"), // Create multer object
    // AFTER : Create multer object
    imageUpload = multer({
        storage: multer.diskStorage(
            {
                destination: function (req, file, cb) {
                    cb(null, imagePath);
                },
                filename: function (req, file, cb) {
                    cb(
                        null,
                        req.params.image_hash + "." + mime.extension(file.mimetype)
                    );
                }
            }
        )
    });


// GET

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function getStories (request, response, next) {
    pool.query("SELECT storyid AS id, title, author, description, category  FROM stories", (error, results) => {
        if (error) {
            next(error);
            return;
        }
        try {
            response.status(200).json(results.rows);
        }
        catch (err) {
            next(err);
        }
    });
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function getStoryStructure (request, response, next) {
    const query = {
        name: "get-story-structure",
        text: "SELECT story_json FROM stories WHERE storyID = $1",
        values: [request.params.storyId]
    };

    pool.query(query,
        (error, results) => {
            if (error) {
                next(error);
                return;
            }

            try {

                console.log(results.rows);
                response.status(200).json(JSON.parse(results.rows[0].story_json));
            } // the json is stored as a string, so we have to parse that string before sending back the data. Would be better to store json properly in the database.
            catch (err) {
                next(err);
            }
        });
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function getSteps (request, response, next) {
    pool.query("SELECT * FROM steps", (error, results) => {
        if (error) {
            next(error);
            return;
        }
        try {
            response.status(200).json(results.rows);
        }
        catch (err) {
            next(err);
        }

    });
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function getStoriesAllData (request, response, next) {
    pool.query("SELECT * FROM stories", (error, results) => {
        if (error) {
            next(error);
            return;
        }
        try {
            response.status(200).json(results.rows);
        }
        catch (err) {
            next(err);
        }

    });
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function getStoryStep (request, response, next) {
    console.log(request.params);
    const query = {
        name: "get-story-step",
        // text: 'SELECT * FROM steps WHERE storyID = $1 AND step_major = $2 AND step_minor = $3',
        text: "SELECT * FROM steps WHERE storyID=$1 AND step_major=$2 AND step_minor=$3",
        values: [request.params.storyId, request.params.step_major, request.params.step_minor]
    };

    pool.query(query,
        (error, results) => {
            if (error) {
                next(error);
                return;
            }
            try {
                response.status(200).json(results.rows);
            }
            catch (err) {
                next(err);
            }
        });

}


/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function getImage (request, response, next) {
    const query = {
        name: "get-image-file-path",
        text: "SELECT * FROM images WHERE storyID = $1 AND step_major = $2 AND step_minor = $3 LIMIT 1",
        values: [request.params.storyId, request.params.step_major, request.params.step_minor]
    };

    pool.query(query,
        (error, results) => {
            if (error) {
                next(error);
                return;
            }

            try {
                if (!Object.hasOwn(results.rows[0], "hash")) {
                    response.status(400).send("nonexistent image id");
                }
                else {
                    const image_path = imagePath + results.rows[0].hash + "." + mime.extension(results.rows[0].filetype);

                    response.sendFile(image_path, {root: __dirname + "/../"});
                }
            }
            catch (err) {
                next(err);
            }
        });
}

/**
 * Retrieve all story steps for a given story
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function getStepsByStoryId (request, response, next) {
    const query = {
        name: "get-steps-by-story-id",
        text: "SELECT * FROM steps WHERE storyID = $1",
        values: [request.params.storyId]
    };

    pool.query(query,
        (error, results) => {
            if (error) {
                next(error);
                return;
            }

            try {
                response.status(200).json(results.rows);
            }
            catch (err) {
                next(err);
            }
        });
}


/**
 * Retrieves image by id from database
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function getImageById (request, response, next) {
    const query = {
        name: "get-image-file-path-by_id",
        text: "SELECT * FROM images WHERE hash = $1 LIMIT 1",
        values: [request.params.image_hash]
    };

    pool.query(query,
        (error, results) => {
            if (error) {
                next(error);
                return;
            }

            try {
                if (!Object.hasOwn(results.rows[0], "hash")) {
                    response.status(400).send("nonexistent image id");
                }
                else {
                    const image_path = imagePath + results.rows[0].hash + "." + mime.extension(results.rows[0].filetype);

                    response.sendFile(image_path, {root: __dirname + "/../"});
                }
            }
            catch (err) {
                next(err);
            }
        });
}


/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function getHtml (request, response, next) {
    const query = {
        name: "get-hml",
        text: "SELECT html FROM steps WHERE storyID = $1 AND step_major = $2 AND step_minor = $3 LIMIT 1",
        values: [request.params.storyId, request.params.step_major, request.params.step_minor]
    };

    pool.query(query,
        (error, results) => {
            if (error) {
                next(error);
                return;
            }
            try {
                console.log(results.rows.size);
                response.status(201).send(results.rows[0].html);
            }
            catch (err) {
                next(err);
            }
        });
}


// POST/PUT

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function createStory (request, response, next) {
    const {name, category} = request.body;

    console.log("request.body");
    console.log(request.body);
    const query_new_story = {
            name: "new-story",
            text: "INSERT INTO stories (title, category, story_json, author, description) VALUES ($1, $2, $3,$4,$5)",
            values: [request.body.story_json.title, null, request.body.story_json, request.body.author, request.body.description]
        },
        query_latest_story_id = {
            name: "latest-story-id",
            text: "SELECT max(storyID) FROM stories",
            values: []
        };

    pool.query(query_new_story,
        (error, resultStory) => {
            if (error) {
                next(error);
                return;
            }
            console.log("sdgfas", resultStory.rows[0]);

            // if successfully inserted, return latest story ID
            const storyID = null;

            pool.query(query_latest_story_id,
                (error2, results) => {
                    if (error2) {
                        next(error2);
                        return;
                    }
                    try {
                        console.log(results.rows[0]);
                        response.status(201).send({success: true, storyID: results.rows[0].max});
                    }
                    catch (err) {
                        next(err);
                    }
                });
        });
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function createStep (request, response, next) {
    const query = {
        name: "new-step",
        text: "INSERT INTO steps (storyID, step_major, step_minor, html) VALUES ($1, $2, $3, $4)",
        values: [request.params.storyId, request.params.step_major, request.params.step_minor, request.body.html]
    };

    pool.query(query,
        (error) => {
            if (error) {
                next(error);
                return;
            }
            try {
                response.status(201).send("step added");
            }
            catch (err) {
                next(err);
            }
        });
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function addImagePath (request, response, next) {
    console.log("ADD IMAGE PATH");

    const filepath = request.file.path,
        filetype = request.file.mimetype,
        query = {
            name: "store-image-file-path",
            text: "INSERT into images (storyId, step_major, step_minor, hash, filetype) VALUES ($1, $2, $3, $4, $5)",
            values: [request.params.storyId, request.params.step_major, request.params.step_minor, request.params.image_hash, filetype]
        };

    console.log(filepath);
    console.log(filetype);
    pool.query(query,
        (error) => {
            if (error) {
                next(error);
                return;
            }
            try {
                response.json({sucess: true, filepath});
            }
            catch (err) {
                next(err);
            }
        });
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function addHtml (request, response, next) {
    console.log(request);
    const query = {
        name: "store-image-file-path",
        text: "UPDATE steps SET html = $4 WHERE storyID = $1 AND step_major = $2 AND step_minor = $3",
        values: [request.params.storyId, request.params.step_major, request.params.step_minor, request.body.html]
    };

    pool.query(query,
        (error) => {
            if (error) {
                next(error);
                return;
            }
            try {
                response.status(201).send("added html");
            }
            catch (err) {
                next(err);
            }
        });
}


// DELETE

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function deleteStory (request, response, next) {
    // delete all steps...
    const query = {
        name: "delete-step-all-fullstory",
        text: "DELETE FROM steps WHERE storyID = $1",
        values: [request.params.storyId]
    };

    pool.query(query,
        (error) => {
            if (error) {
                next(error);
                return;
            }
            // try{response.status(201).send(`all steps of story deleted`)}catch(err){next(err);}
            // THEN delete story itself
            const query = {
                name: "delete-story",
                text: "DELETE FROM stories WHERE storyID = $1;",
                values: [request.params.storyId]
            };

            pool.query(query,
                (error2) => {
                    if (error2) {
                        next(error2);
                        return;
                    }
                    try {
                        response.status(201).send("story deleted");
                    }
                    catch (err) {
                        next(err);
                    }
                });
        });
    // TODO: delete all images associated with story
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function deleteAllStorySteps (request, response, next) {
    const query = {
        name: "delete-step-all",
        text: "DELETE FROM steps WHERE storyID = $1",
        values: [request.params.storyId]
    };

    pool.query(query,
        (error) => {
            if (error) {
                next(error);
                return;
            }
            try {
                response.status(201).send("all steps of story deleted");
            }
            catch (err) {
                next(err);
            }
        });
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function deleteStepMajor (request, response, next) {
    const query = {
        name: "delete-step-major",
        text: "DELETE FROM steps WHERE storyID = $1 AND step_major = $2;",
        values: [request.params.storyId, request.params.step_major]
    };

    pool.query(query,
        (error) => {
            if (error) {
                next(error);
                return;
            }
            try {
                response.status(201).send("major step deleted");
            }
            catch (err) {
                next(err);
            }
        });
}

/**
 * description
 *
 * @param {Object} request description
 * @param {Number} response description
 * @param {function} next description
 * @returns {void}
 */
function deleteStepMinor (request, response, next) {
    const query = {
        name: "delete-step-minor",
        text: "DELETE FROM steps WHERE storyID = $1 AND step_major = $2 AND step_minor = $3;",
        values: [request.params.storyId, request.params.step_major, request.params.step_minor]
    };

    pool.query(query,
        (error) => {
            if (error) {
                next(error);
                return;
            }
            try {
                response.status(201).send("minor step deleted");
            }
            catch (err) {
                next(err);

            }
        });
}


module.exports = {
    imageUpload,
    getStories,
    getStoriesAllData,
    getStoryStructure,
    getSteps,
    getStoryStep,
    getStepsByStoryId,
    createStory,
    createStep,
    deleteStory,
    deleteAllStorySteps,
    deleteStepMajor,
    deleteStepMinor,
    addImagePath,
    addHtml,
    getImage,
    getImageById,
    getHtml
};

