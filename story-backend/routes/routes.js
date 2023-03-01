const {Date} = require("core-js");
const express = require("express");
const path = require("path");
const controllers = require("../controllers/controllers"),
    router = express.Router();

module.exports = router;

// GET
router.get("/story", controllers.getStories);
router.get("/story/:storyId", controllers.getStoryStructure);
router.get("/step/:storyId/:step_major/:step_minor/image", controllers.getImage);
router.get("/step/:storyId/:step_major/:step_minor/image/:imageId", controllers.getImage);

router.get("/step/:storyId/:step_major/:step_minor/html", controllers.getHtml);
router.get("/step/:storyId/:step_major/:step_minor", controllers.getStoryStep);


// POST
router.post("/add/story", controllers.createStory);
router.post("/add/step/:storyId/:step_major/:step_minor", controllers.createStep);
router.post("/add/step/:storyId/:step_major/:step_minor/:image_hash/image", controllers.imageUpload.single("image"), controllers.addImagePath);
router.post("/add/step/:storyId/:step_major/:step_minor/html", controllers.addHtml);


// DELETE
router.delete("/delete/story/:storyId", controllers.deleteStory);
router.delete("/delete/step/:storyId/", controllers.deleteAllStorySteps);
router.delete("/delete/step/:storyId/:step_major/", controllers.deleteStepMajor);
router.delete("/delete/step/:storyId/:step_major/:step_minor", controllers.deleteStepMinor);


// DEBUGGING
router.get("/debug/step", controllers.getSteps);
router.get("/debug/story", controllers.getStoriesAllData);
