import axios from "axios";
import handleAxiosResponse from "../../../../utils/handleAxiosResponse";
import {prepareLiterals} from "../utils/literalFunctions";

// TODO: JSDoc
const actions = {
    instanceChanged ({commit, dispatch}, instanceId) {
        commit("setCurrentInstanceId", instanceId);
        dispatch("prepareModule");
    },
    prepareModule ({commit, dispatch, getters}) {
        dispatch("resetModule", false);

        const {currentInstance} = getters,
            {requestConfig: {layerId, restLayerId, storedQueryId}} = currentInstance,
            restService = restLayerId
                ? Radio.request("RestReader", "getServiceById", restLayerId)
                : Radio.request("ModelList", "getModelByAttributes", {id: layerId});

        if (restService) {
            const {selectSource} = currentInstance,
                service = {url: restService.get("url")};

            // NOTE: The extra object is sadly needed so that the object is reactive :(
            commit("setRequiredValues", {...prepareLiterals(currentInstance.literals)});

            if (selectSource) {
                dispatch("retrieveData");
            }
            if (!storedQueryId && layerId) {
                service.typeName = restService.get("featureType");
            }
            commit("setService", service);
        }
        else {
            dispatch("resetModule", true);
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.wfsSearch.wrongConfig", {name: this.name}), {root: true});
        }
    },
    resetModule ({commit}, closedTool) {
        commit("setAddedOptions", []);
        commit("setRequiredValues", null);
        commit("setSelectedOptions", {});
        commit("setService", null);

        if (closedTool) {
            commit("setCurrentInstance", 0);
            commit("setParsedSource", null);
            commit("setActive", false);
        }
    },
    retrieveData ({commit, getters}) {
        const {currentInstance: {selectSource}} = getters;

        axios.get(selectSource)
            .then(response => handleAxiosResponse(response, "WfsSearch, retrieveData"))
            .then(data => commit("setParsedSource", data));
    }
};

export default actions;
