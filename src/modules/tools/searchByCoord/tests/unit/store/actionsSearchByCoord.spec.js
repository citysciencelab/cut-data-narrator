import sinon from "sinon";
import {expect} from "chai";
import actions from "../../../store/actionsSearchByCoord";

describe("src/modules/tools/searchByCoord/store/actionsSearchByCoord.js", () => {
    let commit, dispatch, getters;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("validateInput", () => {
        it("Validates the coordinates according to the ETRS89 coordinate system", () => {
            const state = {
                currentSelection: "ETRS89",
                coordinatesEasting: {id: "easting", name: "", value: "564459.13", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

            expect(commit.firstCall.args[0]).to.equal("resetEastingMessages");
        });
        it("Throws an Error for missing coordinates - ETRS89", () => {
            const state = {
                currentSelection: "ETRS89",
                coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);

            expect(commit.firstCall.args[0]).to.equal("resetEastingMessages");
            expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
        });
        it("Throws an Error for wrong coordinates - ETRS89", () => {
            const state = {
                currentSelection: "ETRS89",
                coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);

            expect(commit.firstCall.args[0]).to.equal("resetNorthingMessages");
            expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
        });
        it("Validates the coordinates according to the WGS84 coordinate system", () => {
            const state = {
                currentSelection: "WGS84",
                coordinatesEasting: {id: "easting", name: "", value: "53° 33′ 25", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

            expect(commit.firstCall.args[0]).to.equal("resetEastingMessages");
        });
        it("Throws an Error for missing coordinates - WGS84", () => {
            const state = {
                currentSelection: "WGS84",
                coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);

            expect(commit.firstCall.args[0]).to.equal("resetEastingMessages");
            expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
        });
        it("Throws an Error for wrong coordinates - WGS84", () => {
            const state = {
                currentSelection: "WGS84",
                coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);

            expect(commit.firstCall.args[0]).to.equal("resetNorthingMessages");
            expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
        });
        it("Validates the coordinates according to the WGS84(Dezimalgrad) coordinate system", () => {
            const state = {
                currentSelection: "WGS84(Dezimalgrad)",
                coordinatesEasting: {id: "easting", name: "", value: "53.55555°", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

            expect(commit.firstCall.args[0]).to.equal("resetEastingMessages");
        });
        it("Throws an Error for missing coordinates - WGS84(Dezimalgrad)", () => {
            const state = {
                currentSelection: "WGS84(Dezimalgrad)",
                coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);

            expect(commit.firstCall.args[0]).to.equal("resetEastingMessages");
            expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
        });
        it("Throws an Error for wrong coordinates - WGS84(Dezimalgrad)", () => {
            const state = {
                currentSelection: "WGS84(Dezimalgrad)",
                coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
            };

            actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);

            expect(commit.firstCall.args[0]).to.equal("resetNorthingMessages");
            expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
        });
    });
    describe("formatInput", () => {
        it("Does not format coordinates of the ETRS89 format and moves to coordinates", () => {
            const state = {
                currentSelection: "ETRS89",
                coordinatesEasting: {id: "easting", name: "", value: "564459.13", errorMessage: ""},
                coordinatesNorthing: {id: "northing", name: "", value: "5935103.67", errorMessage: ""}
            };

            actions.formatInput({state, commit, getters}, [state.coordinatesEasting, state.coordinatesNorthing]);

            expect(commit.firstCall.args[0]).to.equal("setSelectedCoordinates");
            expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
            expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
            expect(commit.thirdCall.args[1]).to.equal("564459.13");
        });
    });
    describe("transformCoordinates", () => {
        it("Does not transform coordinates of the ETRS89 format and moves to coordinates", () => {
            const state = {
                currentSelection: "ETRS89",
                selectedCoordinates: ["564459.13", "5935103.67"]
            };

            actions.transformCoordinates({state, dispatch});

            expect(dispatch.firstCall.args[0]).to.equal("setZoom");
            expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            expect(dispatch.secondCall.args[1]).to.eql(["564459.13", "5935103.67"]);
        });
        it("Transforms coordinates of the WGS84 format and moves to coordinates", () => {
            const state = {
                currentSelection: "WGS84",
                selectedCoordinates: [["53", "33", "25"], ["9", "59", "50"]]
            };

            actions.transformCoordinates({state, dispatch});

            expect(dispatch.firstCall.args[0]).to.equal("setZoom");
            expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
        });
        it("Transforms coordinates of the WGS84(Dezimalgrad) format and moves to coordinates", () => {
            const state = {
                currentSelection: "WGS84(Dezimalgrad)",
                selectedCoordinates: [["53.55555", ""], ["10.01234", ""]]
            };

            actions.transformCoordinates({state, dispatch});

            expect(dispatch.firstCall.args[0]).to.equal("setZoom");
            expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
        });
    });
});
