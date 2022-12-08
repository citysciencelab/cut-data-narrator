import {expect} from "chai";
import {SensorThingsMqtt} from "../../sensorThingsMqtt.js";

describe("src/utils/sensorThingsMqtt", () => {
    describe("constructor", () => {
        const options = {
            host: "foo",
            port: "1234",
            path: "",
            protocol: "",
            mqttVersion: "",
            rhPath: ""
        };

        it("should have key for connector from the instaces object if new instance is created", () => {
            new SensorThingsMqtt(options);

            expect(SensorThingsMqtt.instances).to.have.all.keys(JSON.stringify(options));
        });
    });
});
