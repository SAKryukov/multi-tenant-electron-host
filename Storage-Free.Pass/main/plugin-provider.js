module.exports.pluginProvider = (() => {

    const { definitionSet } = require("./definition-set.js");
    const fs = require("node:fs");
    const path = require("node:path");
    const { app } = require("electron");

    let applicationPath, window;

    pluginProvider = {
        setup: environment => {
            applicationPath = environment.applicationPath;
            window = environment.window;
        }, //setup
        sendScripts: channel => {
            cryptoFile = null;
            cryptoFileFound = false;
            accountsFile = null;
            accountFileFound = false;
            const plugins = { crypto: { filename: null, found: false }, accounts: { filename: null, found: false } };
            window.webContents.send(channel, plugins);
        }, //sendScripts
    }; //pluginProvider

    return pluginProvider;

})();
