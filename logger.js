var pmloglib, logContext;

try {
    pmloglib = require("pmloglib.node");
    logContext = new pmloglib.Context("flowmgr");
} catch(e) {
    console.error("[Warning] unabled to load pmloglib.", e);
    pmloglib = {
        LOG_ERR: "ERROR",
        LOG_WARNING: "WARNING",
        LOG_INFO: "INFO",
        LOG_DEBUG: "DEBUG"
    }
    logContext = {
        log: function(level, id, props, message) {
            if (level !== pmloglib.LOG_DEBUG)
                console.log(level, id, props, message);
            else
                console.log(level, message);
        }
    };
}

function makeLogFunc(level) {
    var level = pmloglib[level];
    return function(id, message, props) {
        logContext.log(level, id, props || {}, message);
    }
}

module.exports = {
    err: makeLogFunc("LOG_ERR", "error"),
    warn: makeLogFunc("LOG_WARNING", "warning"),
    info: makeLogFunc("LOG_INFO", "info"),
    debug: function(message) {
        logContext.log(pmloglib.LOG_DEBUG, message);
    }
}
