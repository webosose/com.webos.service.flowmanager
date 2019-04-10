var RED = require("node-red");
var express = require("express");

var http = require('http');
var path = require('path');
var deepmerge = require('deepmerge').default;

var LunaBus = require('./lunabus.js');
var Logger = require('./logger.js');
var pmLogId = "global";
var SID = "com.webos.service.flowmanager";

// for flow files
var flowFile = 'flows.json';
var baseDir = process.env.FLOW_DIR;
if (!baseDir) {
    baseDir = "/media/internal/flow";
    Logger.warn("global", "The FLOW_DIR doesn't specified by env. Fallback to " + baseDir);
}

var lunaBus = new LunaBus(SID);

var flowManager = {};

function lunaCallLaunch(params, callback) {
    Logger.info(pmLogId, "lunaCallLaunch " + JSON.stringify(params));
    return lunaBus.call("luna://com.webos.service.applicationmanager/launch", params, callback);
}

function lunaCall(url, params, callback, cancelCallback) {
    Logger.debug("global: lunaCall " + url + " " +JSON.stringify(params));
    return lunaBus.call(url, params, callback, cancelCallback);
}

function lunaCallCancel(id) {
    Logger.debug("global: lunaCallCancel " + id);
    return lunaBus.cancel(id);
}

function registerLunaCB(callback, out) {
    if (typeof flowManager.out === "function") {
        flowManager.out();
        flowManager.out = null;
    }

    flowManager.cb = callback;
    flowManager.out = out;
}

// Create an Express app
var app = express();

// Add a simple route for static content served from 'public'
app.use("/", express.static("public"));

// Create a server
var server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
var settings = {
    httpAdminRoot: "/red",
    httpNodeRoot: "/api",
    userDir: baseDir,
    nodesDir: [path.join(__dirname, 'nodes'), "/media/internal/flowmgr/nodes/"],
    paletteCategories: ['webos', 'subflows', 'input', 'output', 'function', 'social', 'mobile', 'storage', 'analysis', 'advanced'],
    flowFile: flowFile,
    functionGlobalContext: {
        registerLunaCB: registerLunaCB,
        lunaCallLaunch: lunaCallLaunch,
        lunaCall: lunaCall,
        lunaCallCancel: lunaCallCancel,
        logger: Logger,
        deepmerge: deepmerge
    } // enables global context
};

// Initialise the runtime with a server and settings
RED.init(server, settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot, RED.httpNode);

server.listen(8000);

// Start the runtime
RED.start();
