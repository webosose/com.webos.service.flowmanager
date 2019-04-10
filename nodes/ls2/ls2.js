module.exports = function (RED) {

    function ls2(config) {
        RED.nodes.createNode(this, config);
        var call = this.context().global.get("lunaCall");
        var callCancel = this.context().global.get("lunaCallCancel");
        var logger = this.context().global.get("logger");
        var pmlogId = "ls2";

        this.requestUrl = config.url;
        this.params = JSON.parse(config.params || '{}');
        this.isSubscribe = config.isSubscribe;

        var handleMessage = (message) => {
            if (message === null) {
                return;
            }
            var msg = {payload: message};
            if (message.hasOwnProperty('returnValue') && message.returnValue === false) {
                this.send([null, msg]);
            } else {
                this.send([msg, null]);
            }
        };

        this.on('input', function (msg) {
            logger.info(pmlogId, "input: " + JSON.stringify(msg));
            var parameters = Object.assign({}, this.params, (msg.payload.params || {}));

            if (this.subscriptionID !== 'undefined' && this.subscriptionID > 0) {
                callCancel(this.subscriptionID);
            }

            if (this.isSubscribe) {
                parameters.subscribe = true;
            }

            logger.info(pmlogId, "merged params = " + JSON.stringify(parameters));
            this.subscriptionID = call("luna://" + this.requestUrl, parameters, handleMessage);
            logger.debug("[" + pmlogId +"] subscriptionID = " + this.subscriptionID);
        });

        this.on('close', function() {
            if (this.subscriptionID > 0) {
                callCancel(this.subscriptionID);
            }
        });
    }
    RED.nodes.registerType("ls2", ls2);
}
