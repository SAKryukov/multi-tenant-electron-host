module.exports.pluginProvider = (() => {

    let definitionSet, fs, path, applicationPath, window;

    pluginProvider = {
        setup: environment => {
            definitionSet = environment.definitionSet;
            fs = environment.fs;
            path = environment.path;
            applicationPath = environment.applicationPath;
            window = environment.window;
        }, //setup
        sendScripts: channel => {
            const directory = path.join(applicationPath, definitionSet.plugin.directory);
            const plugins = [];
            if (fs.existsSync(directory)) {
                const names = fs.readdirSync(directory);
                for (const name of names)
                    if (path.extname(name).toLowerCase() == definitionSet.plugin.pluginFileSuffix)
                        plugins.push(path.join(directory, name));
            } //if plugin directory exists
            window.webContents.send(channel, plugins, definitionSet.plugin.directory);
        }, //sendScripts
    }; //pluginProvider

    return pluginProvider;

})();
