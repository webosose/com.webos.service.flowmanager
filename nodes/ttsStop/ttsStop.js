module.exports = function (RED) {

    function ttsStop(config) {
        RED.nodes.createNode(this, config);
        var call = this.context().global.get("lunaCall");
        var callCancel = this.context().global.get("lunaCallCancel");
        var logger = this.context().global.get("logger");
        var pmlogId = "ttsStop";

        this.fadeOut = config.fadeOut;

        var handleResponse = (message) => {
            logger.debug(pmlogId + " : handleResponse msg = " + JSON.stringify(message));
            if (message === null) {
                return;
            }
            this.send({payload:message});
        };

        this.on('input', function (msg) {
            logger.info(pmlogId, "input: " + JSON.stringify(msg));
            var params = {
                fadeOut: this.fadeOut
            }

            Object.assign(params, (msg.payload.params || {}));

            logger.info(pmlogId, "merged params = " + JSON.stringify(params));
            call("luna://com.webos.service.tts/stop", params, handleResponse);
        });
    }
    RED.nodes.registerType("tts:stop", ttsStop);
}
