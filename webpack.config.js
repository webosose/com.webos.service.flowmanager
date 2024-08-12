const path = require('path');
const webpack = require('webpack');

const APP_DIR = path.resolve(__dirname);
const BUILD_DIR = path.resolve(__dirname, './dist');

const serverConfig = {
    devtool: false,
    target: 'node',
    entry: {
        app: APP_DIR + '/index.js'
    },
    output: {
        hashFunction: "sha256",
        filename: 'index.js',
        path: BUILD_DIR
    },
    externals: {
        'webos-service': 'require("webos-service")',
        'pmloglib.node': 'require("pmloglib.node")',
        'node-red': 'require("node-red")'
    },
    node: {
        __dirname: false
    }
};

module.exports = serverConfig;
