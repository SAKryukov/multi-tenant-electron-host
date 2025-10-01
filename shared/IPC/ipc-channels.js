"use strict";

const ipcChannel = {
    fileIO: {
        openFile: 0,
        openFromCommandLine: 0,
        saveFileAs: 0,
        saveExistingFile: 0,
        resetApplicationTitle: 0, // for file/new
        closeApplication: 0, // for don't save dialog
    }, //fileIO
    plugin: {
        loadAll: 0,
    }, //plugin
    metadata: {
        metadataPush: 0,
        source: 0, // show application source code in a default external browser
    }, //metadata
    ui: {
        fullscreen: 0,
        fullscreenToggle: 0,
        requestToIgnoreUnsavedData: 0,
        showExternalUri: 0,
    }, //ui
}; //ipcChannel

const bridgeAPI = {
    bridgeFileIO: 0,
    bridgePlugin: 0,
    bridgeMetadata: 0,
    bridgeUI: 0,
}; //bridgeAPI

for (const subset of [ipcChannel.fileIO, ipcChannel.plugin, bridgeAPI, ipcChannel.metadata, ipcChannel.ui])
    for (const index in subset)
        if (!subset[index])
            subset[index] = index;
Object.freeze(ipcChannel);

if (typeof module != typeof undefined)
    module.exports = { bridgeAPI, ipcChannel };
