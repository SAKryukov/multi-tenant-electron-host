const definitionSet = {
    events: {
        activate: 0,
        close: 0,
        readyToShow: "ready-to-show",
        windowAllClosed: "window-all-closed",
    },
    paths: {
        preload: "api/preload.js",
        image: "main/editor.png",
        index: "renderer/index.html",
        package: "package.json",
        metadata: "metadata.json",
    },
    utility: {
        fileDialog: {
            titleOpenFile: `Open text file${String.fromCharCode(0x2026)}`,
            titleSaveFile: `Save text file as${String.fromCharCode(0x2026)}`,
            ioError: "File I/O error",
        },
        aboutDialog: {
            buttons: ["Close"],
            title: "About Electron Application",
        },
        fileNaming: {
            title:  (baseFilename, title) =>
                `${baseFilename} ${String.fromCharCode(0x2014)} ${title}`,
        },
    }, //utility
    plugin: {
        directory: "plugins",
        pluginFileSuffix: ".js",
    }, //plugin
    isDarwin: process => process.platform == 'darwin',
    applicationIcon: "images/editor.png",
    createWindowProperties: (title, icon, preloadScript) => {
        return { // see https://www.electronjs.org/docs/latest/api/base-window#new-basewindowoptions
            resizable: true,
            minWidth: 800,
            minHeight: 320,
            width: 1400,
            //height: 600,
            show: false,
            frame: true,
            transparent: false,
            title: title,
            icon: icon,
            webPreferences: { //https://www.electronjs.org/docs/latest/api/structures/web-preferences
                preload: preloadScript,
                sandbox: false, // required with CommonJS or ES Modules used in preload
                //nodeIntegration: true,
            } //webPreferences
        };
    }, //createWindowProperties    
};

for (const subset of [definitionSet.events])
    for (const index in subset)
        if (!subset[index])
            subset[index] = index;
Object.freeze(definitionSet);

module.exports = { definitionSet };
