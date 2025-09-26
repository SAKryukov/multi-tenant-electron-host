module.exports.pluginProvider = (() => {

    const { definitionSet } = require("./definition-set.js");
    const fs = require("node:fs");
    const path = require("node:path");

    let applicationPath, window;

    pluginProvider = {
        setup: environment => {
            applicationPath = environment.applicationPath;
            window = environment.window;
        }, //setup
        sendScripts: channel => {
            const directory = path.join(applicationPath, definitionSet.plugin.directory);
            const plugins = [];
            if (fs.existsSync(directory)) {
                const names = fs.readdirSync(directory, { recursive: true });
                for (const name of names)
                    if (path.extname(name).toLowerCase() == definitionSet.plugin.pluginFileSuffix)
                        plugins.push(path.join(directory, name));
            } //if plugin directory exists
            window.webContents.send(channel, plugins, definitionSet.plugin.directory);
        }, //sendScripts
    }; //pluginProvider

    return pluginProvider;

})();
