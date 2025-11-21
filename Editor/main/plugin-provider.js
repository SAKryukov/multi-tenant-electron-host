"use strict";

module.exports.pluginProvider = (() => {

    const { definitionSet } = require("./definition-set.js");
    const fs = require("node:fs");
    const path = require("node:path");
    const { app } = require("electron");

    let applicationPath, window;

    const pluginProvider = {
        setup: environment => {
            applicationPath = environment.applicationPath;
            window = environment.window;
        }, //setup
        sendScripts: channel => {
            const multiTenantApplicationPath = app.getAppPath();
            const packagePath = path.dirname(path.dirname(multiTenantApplicationPath));
            const directory = definitionSet.plugin.isPackedForm(multiTenantApplicationPath)
                ? path.join(packagePath, definitionSet.plugin.directoryInPackage)
                : path.join(applicationPath, definitionSet.plugin.directory);
            const plugins = [];
            if (fs.existsSync(directory)) {
                const names = fs.readdirSync(directory, { recursive: true });
                for (const name of names)
                    if (path.extname(name).toLowerCase() == definitionSet.plugin.pluginFileSuffix)
                        plugins.push(path.join(directory, name));
            } //if plugin directory exists
            if (plugins.length < 1)
                console.warn(definitionSet.plugin.noPluginsWarning(directory));
            window.webContents.send(channel, plugins, definitionSet.plugin.directory);
        }, //sendScripts
    }; //pluginProvider

    return pluginProvider;

})();
