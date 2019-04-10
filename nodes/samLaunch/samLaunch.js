module.exports = function (RED) {

    var runNextTimerId = 0;
    function samLaunch(config) {
        RED.nodes.createNode(this, config);

        var deepmerge = this.context().global.get("deepmerge");
        var logger = this.context().global.get("logger");
        var pmLogId = "samLaunch";

        this.lunaCallLaunch = this.context().global.get("lunaCallLaunch");
        this.registerLunaCB = this.context().global.get("registerLunaCB");

        this.launchAppId = config.appId;
        this.launchParam = JSON.parse(config.params || '{}');
        this.timeout = config.timeout;

        this.status({fill:"grey",shape:"dot",text:"idle"});

        var launchPoint = (msg) => {
            var params = deepmerge(this.launchParam, msg.payload.params || {});
            logger.info(pmLogId, "launch = " + JSON.stringify({id:this.launchAppId, params:params}));

            this.lunaCallLaunch({id:this.launchAppId, params:params}, (msg) => {
                if (!msg.returnValue) {
                    var msgObj = {id:this.id, name:this.name};
                    msgObj.msg = msg;
                    this.error(msgObj);
                    logger.err(pmLogId, "launch fail = " + JSON.stringify(msgObj.msg));
                }
            });
            
            this.registerLunaCB(handleCB, () => {
                this.status({fill:"grey",shape:"dot",text:"idle"});
            });
            this.status({fill:"red",shape:"dot",text:"running"});

            if (this.timeout > 0) {
                logger.info(pmLogId, "setTimeout timer as " + this.timeout);
                clearTimeout(runNextTimerId);
                runNextTimerId = setTimeout(() => {
                    handleCB({returnValue:true});
                }, this.timeout);
            }
        };

        var handleCB = (message) => {
            if (message === null) {
                return;
            }
            logger.debug("send msg to next node");
            var msg = {payload: message};
            this.send(msg);
        };

        this.on('input', function (msg) {
            logger.info(pmLogId, "start " + (this.name || this.id));

            try {
                launchPoint(msg);
            } catch(e) {
                console.log(e.stack);
                this.error(e);
                logger.err(pmLogId, "err msg : ", e);
            }
        });

        this.on('close', function () {
            if (runNextTimerId) {
                clearTimeout(runNextTimerId);
            }
        });
    }
    RED.nodes.registerType("sam:launch", samLaunch);
}
