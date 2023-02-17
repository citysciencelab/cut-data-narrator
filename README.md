# Data Narrator

## City Science Lab - Connected Urban Twin

<p align="center">
<img src="https://user-images.githubusercontent.com/36763878/219619895-12db4431-32d9-458b-a73f-548052404258.png" alt="drawing" />
</p>

The Data Narrator (DANA) is a **[Masterportal](https://www.masterportal.org/)** add-on that can be used to add text,
photos and images to geo-referenced data sets.
In this way, the usually very technical and purely data-based representations can be supplemented with information and
more descriptive representations.
The data shown is contextualized and complex relationships become easier to understand.
Users click their way through a story step by step. You can test the tool **[here](https://re1.cut.hcu-hamburg.de/mobility-data/)**.

To test DANA with an example story go to the GitHub page of
the **[City Science Lab ](https://github.com/citysciencelab/cut-data-narrator)**
The aforementioned repository includes an example from the real-life experiment 'Mobilities of care'. Topics such as the
mobility behavior of unpaid care workers can thus be communicated and located more easily. This is available under the
portal configuration called **['/mobility-data/'](https://github.com/citysciencelab/cut-data-narrator/tree/dev/portal/mobility-data)**.
The example portal configuration is included in this repository in the example folder. A running portal configuration
that includes 3D data can be
found **[here](https://github.com/citysciencelab/cut-data-narrator/tree/dev/portal/3d-test)**

[![example story video](./doc/videoimage.jpg)](https://user-images.githubusercontent.com/36763878/161025746-b8ac51be-a687-4e63-8bcf-b1da01334ead.mp4 "Example story video - Click to Watch!")

### Story JSON
The main attributes of the **[story.json](https://github.com/citysciencelab/cut-data-narrator/blob/dev/portal/mobility-data/assets/story.json)** configuration file are the follwing:

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
9. "isNoCreateMode" - Defines if the option to get to the story creation is displayed
10. "storyInterval" - Definition of the automatic playback of a story in millisecond

The story steps attributes in the **[story.json](https://github.com/citysciencelab/cut-data-narrator/blob/dev/portal/mobility-data/assets/story.json)** are the follwing:

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


## Explore your story

After creating your story in the creator section of the Data Narrator, you can download the story as zip file.
The zip file contains a `story.json` and, in case you added HTML content to your story, a `story` folder. You can access the story creator **[here](https://re1.cut.hcu-hamburg.de/mobility-data/)**.

**Example**

story.zip content folder structure

```
story.zip
|-- story.json
|-- story
|    step_1-1.html
|    step_2-1.html
|    step_2-2.html
|   |-- images
|   |   |-- step_1-1_1.png
|   |   |-- step_1-1_2.jpg
```

To explore your own story in the Data Narrator:

1. place the content of the zip file in your portal config folder
2. add a `storyConf` parameter to the `Config` in your portal's `config.js` with the path to the `story.json` as value

**Example**

portal folder structure

```
masterportal/portal
|-- my_portal
|    config.js
|    config.json
|    index.html
|   |-- story.json
|   |-- story
|   |    step_1-1.html
|   |    step_2-1.html
|   |    step_2-2.html
|   |   |-- images
|   |   |   |-- step_1-1_1.png
|   |   |   |-- step_1-1_2.jpg
```


The configuration of the Data Narrator addon in the **[config.json](https://github.com/citysciencelab/cut-data-narrator/blob/dev/portal/mobility-data/config.json)** can include the following parameters

| Name               | Required | Type    | Default        | Description                                                                              |
| ------------------ | -------- | ------- |----------------| ---------------------------------------------------------------------------------------- |
| active             | no       | Boolean | false          | Whether the tool is initially opened or not.                                             |
| name               | no       | String  | Data Narrator  | Name of the tool in the menu.                                                            |
| glyphicon          | no       | String  | glyphicon-book | CSS class of the glyphicons, which is displayed before the name of the tool in the menu. |
| renderToWindow     | no       | Boolean | true           | Whether the tools is rendered in a separate window or not.                               |
| resizableWindow    | no       | Boolean | true           | Whether the tool window is resizeable or not.                                            |
| isVisibleInMenu    | no       | Boolean | true           | Whether the tool is visible in the menu or not.                                          |
| deactivateGFI      | no       | Boolean | false          | If set to `true`, the filter tool deactivates GFI requests while open.                   |
| initialWidth       | no       | Number  | 500            | The initial width of the tool.                                                           |
| initialWidthMobile | no       | Number  | 300            | The initial width of the tool on mobile devices.                                         |

**Example**

```json
"dataNarrator": {
"name": "Data Narrator",
"glyphicon": "glyphicon-book"
}
```

You also have to adjust the **[config.js](https://github.com/citysciencelab/cut-data-narrator/blob/dev/portal/mobility-data/config.js)** and add the following parameters.

**Example**
```js
const Config = {
    addons: ["dataNarrator"],
    storyConf: "./story.json"
}
```


### Docker setup

Quick setup of a local version of the storytelling tool.

#### Docker Deployment

Deploy the frontend (masterportal and pulled addon from the  **[Dipass Addons](https://bitbucket.org/geowerkstatt-hamburg/dipas-masterportal-addons/src/dev/)** repository) to Docker. Install Docker on your local machine, pull this repository and execute the following command.

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
git clone https://github.com/citysciencelab/cut-data-narrator.git
```

Navigate to the addons folder and into it clone the dipasAddons

```console
git clone https://till-hcu@bitbucket.org/geowerkstatt-hamburg/dipas-masterportal-addons.git
```

Install the `node_modules` required for the addons:

Step 1:

```console
cd cut-data-narrator\addons\dipasAddons\dataNarrator
npm install
```

Install the `node_modules` required for the Masterportal:

```console
cd cut-data-narrator
npm install
```

With this, all dependencies are installed.

Add the following attributes to config.js of your configured portal:

```
addons: ["storyTellingTool"],
vuetify: "addons/storyTellingTool/vuetify",
storyConf: "./ressources/story.json",
uiStyle: "table",

```

Add the following line to index.html of your configured portal:

```
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Material+Icons">
```

Copy and potentially replace the file
```
cut-data-narrator\portal\addonsConf.json
```
to
```
cut-data-narrator\addons\
```



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
portal\mobility-data\assets
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

