# Data Narrator
## City Science Lab - Connected Urban Twin

<p align="center">
<img src="./doc/data-narrator-logo.png" alt="drawing" width="600"/>
</p>

The Data Narrator (DANA) is a **[Masterportal](https://www.masterportal.org/)** add-on that can be used to add text,
photos and images to geo-referenced data sets.
In this way, the usually very technical and purely data-based representations can be supplemented with information and
more descriptive representations.
The data shown is contextualized and complex relationships become easier to understand.
Users click their way through a story step by step.

To tests the STT with an example story go to the GitHub page of
the **[City Science Lab ](https://github.com/citysciencelab/cut-storytelling-tool)**
The aforementioned repository includes an example from the real-life experiment 'Mobilities of care'. Topics such as the
mobility behavior of unpaid care workers can thus be communicated and located more easily. This is available under the
portal configuration called '/mobility-data/'.
The example portal configuration is included in this repository in the example folder. A running portal configuration
that includes 3D data can be
found **[here](https://github.com/citysciencelab/cut-storytelling-tool/tree/main/portal/3d-test)**

[![example story video](./doc/videoimage.jpg)](https://user-images.githubusercontent.com/36763878/161025746-b8ac51be-a687-4e63-8bcf-b1da01334ead.mp4 "Example story video - Click to Watch!")

### Story JSON

The main attributes of the story.json configuration file are the follwing:

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

The story steps attributes in the story.json are the follwing:

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

## Configuration

The Data Narrator let's the user explore and create stories.

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

## Explore your story

After creating your story in the creator section of the Data Narrator, you can download the story as zip file.
The zip file contains a `story.json` and, in case you added HTML content to your story, a `story` folder.

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

To explore your story in the Data Narrator ...

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

config.js

```js
const Config = {
    addons: ["dataNarrator"],
    storyConf: "./story.json",
    [...]
};
```
