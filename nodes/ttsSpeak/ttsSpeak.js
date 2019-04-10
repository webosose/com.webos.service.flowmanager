module.exports = function (RED) {

    function ttsSpeak(config) {
        RED.nodes.createNode(this, config);
        var call = this.context().global.get("lunaCall");
        var callCancel = this.context().global.get("lunaCallCancel");
        var logger = this.context().global.get("logger");
        var pmlogId = "ttsSpeak";

        this.text = config.text;
        this.clear = config.clear;
        this.isSubscribe = config.isSubscribe;
        this.lang = config.lang;

        var handleResponse = (message) => {
            logger.debug(pmlogId + " : handleResponse msg = " + JSON.stringify(message));
            if (message === null) {
                return;
            }
            var msg = {payload: message};
            if (!this.isSubscribe) {
                this.send(msg);
            } else if (message.hasOwnProperty('msgStatus') && message.msgStatus === 'done') {
                this.send(msg);
            }
        };

        var handleCancelResponse = (message) => {
            logger.debug(pmlogId + " : handleCancelResponse msg = " + JSON.stringify(message));
            if (message && 
                message.hasOwnProperty('msgStatus') &&
                message.msgStatus === 'done') {
                this.send({payload: message});
            }
        }

        this.on('input', function (msg) {
            logger.info(pmlogId, "input: " + JSON.stringify(msg));
            var params = {
                text: this.text
            }
            if (this.clear) { params.clear = this.clear; }
            if (this.isSubscribe) { params.subscribe = this.isSubscribe; }
            if (this.lang) { params.language = this.lang; }

            Object.assign(params, (msg.payload.params || {}));

            if (this.subscriptionID !== 'undefined' && this.subscriptionID > 0) {
                callCancel(this.subscriptionID);
            }

            logger.info(pmlogId, "merged params = " + JSON.stringify(params));
            this.subscriptionID = call("luna://com.webos.service.tts/speak", params, handleResponse, handleCancelResponse);
            logger.debug("[" + pmlogId +"] subscriptionID = " + this.subscriptionID);
        });

        this.on('close', function() {
            if (this.subscriptionID > 0) {
                callCancel(this.subscriptionID);
            }
        });
    }
    RED.nodes.registerType("tts:speak", ttsSpeak);
}
