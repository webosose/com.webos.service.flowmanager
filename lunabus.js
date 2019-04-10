var Service = require('webos-service');
var Logger = require('./logger.js');
var PmLogId = "LunaBus";

function LunaBus(serviceId) {
    this.subscriptions = {};
    this.registered = {};
    this.SID = 0;
    this.handle = new Service(serviceId);
}

LunaBus.prototype.call = function(url, params, callback, cancelCallback) {
    if (this.handle) {
        var handler;
        var cancelHandler;
        var errObj = new Error();

        // create handler
        handler = function(res) {
            Logger.debug(PmLogId + ": recv response =" + JSON.stringify(res));
            if (res.payload.hasOwnProperty('returnValue') && !res.payload.returnValue) {
                console.error(new Date(), " luna call error - ", res.payload, errObj.stack, url, params);
                Logger.err(PmLogId, "luna call error : " + JSON.stringify(res.payload));
                Logger.err(PmLogId, "url:" + url + ", params: " + JSON.stringify(params));
                Logger.err(PmLogId, errObj.stack);
            }
            if (typeof callback === "function") {
                callback(res.payload);
            }
        }.bind(this);

        cancelHandler = function(res) {
            Logger.debug(PmLogId + ": cancel handler : " + JSON.stringify(res));
            cancelCallback(res.payload);
        }.bind(this);

        if (typeof callback !== "function" && params.subscribe) {
            // if no callback and subscription, error!
            Logger.err(PmLogId, "request subscription but no callback function");
            return -1;
        }

        // create call
        if (params.subscribe) {
            var call = this.handle.subscribe(url, params);
            call.addListener('response', handler);

            if (typeof cancelCallback === "function") {
                Logger.debug(PmLogId + ": add cancel handler");
                call.addListener('cancel', cancelHandler);
            }

            // remember call to protect it from GC or cancel
            var retID = ++this.SID;
            this.subscriptions[retID] = call;
            Logger.debug(PmLogId + ": subscription started: id=" + retID);

            return retID;
        } else {
            this.handle.call(url, params, handler);
            return 0;
        }
    } else {
        Logger.err(PmLogId, "There is no handle.");
        return -1;
    }
}

LunaBus.prototype.cancel = function(id) {
    if (this.subscriptions.hasOwnProperty(id)) {
        this.subscriptions[id].cancel();
        delete this.subscriptions[id];
        Logger.debug(PmLogId + ": subscription canceled: id=" + id);
    }
}

LunaBus.prototype.register = function(func, callback) {
    if (!this.registered.hasOwnProperty(func)) {
        this.registered[func] = this.handle.register(func, callback);
    } else {
        Logger.err(PmLogId, "already registered function: " + func);
    }
}

module.exports = LunaBus;
