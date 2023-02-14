<p align="center">
    <img src="https://user-images.githubusercontent.com/36763878/218791112-6ffb1963-b9d2-4da0-b8d9-5fb06470c4a8.png" alt="drawing" width="600"/>
</p>

# Data Narrator

## City Science Lab - Connected Urban Twin

The Data Narrator is a **[Masterportal](https://www.masterportal.org/)** add-on that can be used to add text, photos
and images to geo-referenced data sets. In this way, the usually very technical and purely data-based representations
can be supplemented with information and more descriptive representations. The data shown is contextualized and complex
relationships become easier to understand. Users click their way through a story step by step.

The current version of the repository includes an example from the real-life experiment 'Mobilities of care'. Topics
such as the mobility behavior of unpaid care workers can thus be communicated and located more easily. This is available
under the portal configuration called '/mobility-data/'.

https://user-images.githubusercontent.com/36763878/161025746-b8ac51be-a687-4e63-8bcf-b1da01334ead.mp4

### Story JSON

The main attributes of the story configuration file are the follwing:

1. "title" - The name of the story
2. "author" - The author visible at the story entry page
3. "description" - The description of the story shown on the story entry page
4. "coverImagePath" - The cover image of the story shown on the story entry page (stored locally in the portal config
   story folder)
5. "htmlFolder" - The folder that contains the steps html files and images
6. "isScrollytelling" - Indicator if the story should run as a story to scroll and not to click through
7. "chapters" - Array of chapters (e.g. [
   {
   "chapterNumber": 1,
   "chapterTitle": "title"
   },)
8. "steps" - Array of the story steps

The story JSON attributes are the follwing:

1. "stepNumber" - Number of the index of the step
2. "stepWidth" - The maximal width on screen that will be shown
3. "visible" - Set to true if you want to hide the step
4. "associatedChapter" - Reference to the chapter number
5. "title" - Title of the step (e.g. "Intro")
6. "htmlFile" - String of the .html file containing the steps content (e.g. step_1-1.html)
7. "centerCoordinate" - Array for the definition of the steps map center position (e.g. [
   555894.6872343315,
   5931378.984010641
   ])
8. "zoomLevel" - Number of the steps map zoom level (e.g. 3)
9. "layers" - Array of IDs that define the map layers shown for this step (e.g. [
   "128",
   "129"
   ])
10. "interactionAddons" - Array of strings that indicating the active addons for this step (e.g. [
    "gfi",
    "measure"])
11. "is3D" - Boolean indicating if the 3D map is activated for this step
12. "navigation3D": - If 'is3D' is true, then this attribute contains the camera configuration. (e.g. {
    "cameraPosition": [
    9.948301,
    53.552374,
    343.8
    ],
    "heading": 0.38138509963163635,
    "pitch": -0.4525214263618002
    })
    In the case of a 3D mode, the attributes 'zoomLevel' and 'centerCoordinate' are obsolete

### Setup

1. copy master portal storytelling tool repository and follow the **[Masterportal setup](#masterportal-setup)**
2. copy portal configuration 'basic' and select desired name for portal
3. remove all unused files from the folder '*portalname*/resources' and corresponding references from config.js
4. enter all used services into a JSON and reference them in config.js in the attribute 'layerConf
5. configure attribute namedProjections in config.js
6. specify the attributes startCenter, extent, startZoomLevel, epsg of the mapView attribute in config.json
7. fill the attributes background maps and subject data with the corresponding IDs of the JSON from point 4
8. add the following attributes to config.js:

```
addons: ["storyTellingTool"],
vuetify: "addons/storyTellingTool/vuetify",
storyConf: "./ressources/story.json",
uiStyle: "table",

```

9. configure the tools attribute of config.json as follows:

```
    "tools": {
        "name": "translate#common:menu.tools.name",
        "glyphicon": "glyphicon-wrench",
        "children": {
            "storyTellingTool": {
                "name": "translate#additional:modules.tools.storyTellingTool.title",
                "glyphicon": "glyphicon-book",
                "active": true
            }
        }
    },
```

10. add the following line to index.html:

```
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Material+Icons">
```

12. create test story
13. start with docker or npm

### Docker

Quick setup of a local version of the storytelling tool.

#### Docker Deployment

Deploy the frontend and backend applications including database to Docker.

```
docker-compose up
```

Default URL for the application deployed on your local machine is: http://localhost/mobility-data/

### Masterportal setup

You can also start the application with npm if you plan on connecting a database, creating a new story or adjusting the
code to your needs.

#### Node.js

Install **[Node.js](http://nodejs.org)**. Last known working version is *v10.18.0 LTS* with *NPM version 6.13.4*.

#### Tool installation

Execute the git bash as admin and navigate to the folder the repository is to be cloned to.

Clone the repository and navigate to the folder created:

```console
git clone https://github.com/citysciencelab/cut-storytelling-tool.git
```

Install the `node_modules` required for the addons:

Step 1:

```console
cd cut-storytelling-tool\addons\storyTellingTool
npm install
```

Install the `node_modules` required for the Masterportal:

```console
cd masterportal
npm install
```

With this, all dependencies are installed.

In case you need further information about how add-ons configured and developed, please refer to
the **[add-ons documentation](doc/addonsVue.md)** for further assistance.

This command will start a local development server.

```console
npm start
```

- After compilation, you may open the following links for comprehensive demo applications:
    - https://localhost:9001/portal/mobility-data Portal that includes the initial Faircare story as well as the data
      gathering tool

An example story can be found in the folder:

```
cut-storytelling-tool\portal\mobility-data\assets
```

The stories are referenced in the storyConf variable in the [config.js](portal\mobility-data\config.js).

---

#### Following is the official documentation of the Masterportal

Official website of the [Masterportal](https://www.masterportal.org/)

The Masterportal is a tool-kit to create geo web applications based on [OpenLayers](https://openlayers.org)
, [Vue.js](https://vuejs.org/) and [Backbone.js](https://backbonejs.org). The Masterportal is Open Source Software
published under the [MIT License](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/License.txt).

The Masterportal is a project by [Geowerkstatt Hamburg](https://www.hamburg.de/geowerkstatt/).

###### Developer section

* [Developer documentation](doc/devdoc.md)
* [Tutorial 01: Creating a new module (Scale switcher)](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/vueTutorial.md)
* [Community board (Developer forum and issue tracker)](https://trello.com/c/qajdXkMa/110-willkommen)
