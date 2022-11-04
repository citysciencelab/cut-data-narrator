import {expect} from "chai";
import handleAxiosErrorModule from "../../../utils/handleAxiosError";
import sinon from "sinon";

describe("src/api/utils/handleAxiosError.js", () => {
    beforeEach(() => {
        sinon.spy(console, "warn");
        sinon.spy(console, "error");
    });
    afterEach(() => {
        console.warn.restore();
        console.error.restore();
    });

    it("should trigger a specific amount of errors and warnings if the given object is a common Error", () => {
        handleAxiosErrorModule.handleAxiosError(undefined, "functionName");
        expect(console.error.calledTwice).to.be.true;
        expect(console.warn.calledOnce).to.be.true;
    });
    it("should trigger a specific amount of errors and warnings if the given object is an (error) object with response", () => {
        handleAxiosErrorModule.handleAxiosError({response: true, request: true}, "functionName");
        expect(console.error.callCount).to.equal(4);
        expect(console.warn.calledOnce).to.be.true;
    });
    it("should trigger a specific amount of errors and warnings if the given object is an (error) object without response but with request", () => {
        handleAxiosErrorModule.handleAxiosError({request: true}, "functionName");
        expect(console.error.calledTwice).to.be.true;
        expect(console.warn.calledOnce).to.be.true;
    });
    it("should also hand over a message to the given callback", () => {
        let lastErrorMessage = null;

        handleAxiosErrorModule.handleAxiosError(undefined, "functionName", errorMessage => {
            lastErrorMessage = errorMessage;
        });
        expect(lastErrorMessage).to.be.a("string");
    });
});
