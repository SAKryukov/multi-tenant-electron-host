"use strict";
const { bridgeAPI, ipcChannel } = require("./ipc-channels.js");
const { ipcRenderer, contextBridge} = require("electron/renderer");

let metadata = null;
ipcRenderer.once(ipcChannel.metadata.metadataPush, (_event, received) => metadata = received);

contextBridge.exposeInMainWorld(bridgeAPI.bridgeFileIO, { // to be used only in renderer loaded from HTML
    openFile: (handler, dialogTitle, defaultPath, filters) => {
            ipcRenderer.send(ipcChannel.fileIO.openFile, dialogTitle, defaultPath, filters);
            ipcRenderer.once(ipcChannel.fileIO.openFile, (_event, filename, text, error) => {
                handler(filename, text, error);
            });
    }, //openFile
    subscribeToCommandLine: handler =>
        ipcRenderer.on(ipcChannel.fileIO.openFromCommandLine, (_event, filename, text, error) => handler(filename, text, error)),
    saveFileAs: (text, handler, dialogTitle, defaultPath, filters, closeApplication) => {
        ipcRenderer.send(ipcChannel.fileIO.saveFileAs, text, dialogTitle, defaultPath, filters, closeApplication);
        ipcRenderer.once(ipcChannel.fileIO.saveFileAs, (_event, filename, error) =>
                handler(filename, error));
    }, //saveFileAs
    saveExistingFile: (filename, text, handler, closeApplication) => {
        ipcRenderer.send(ipcChannel.fileIO.saveExistingFile, filename, text, closeApplication);
        ipcRenderer.once(ipcChannel.fileIO.saveExistingFile, (_event, filename, error) =>
                handler(filename, error));
    }, //saveExistingFile
    closeApplication: () => ipcRenderer.send(ipcChannel.fileIO.closeApplication),
    resetApplicationTitle: () => ipcRenderer.send(ipcChannel.fileIO.resetApplicationTitle),
}); //contextBridge.exposeInMainWorld

contextBridge.exposeInMainWorld(bridgeAPI.bridgePlugin, {
    subscribeToPlugin: handler =>
        ipcRenderer.once(ipcChannel.plugin.loadAll, (_event, plugins, pluginsKeyword) => {
            handler(plugins, pluginsKeyword);
        }),
}); //contextBridge.exposeInMainWorld

contextBridge.exposeInMainWorld(bridgeAPI.bridgeMetadata, {
    pushedMetadata: () => metadata,
    showSource: () =>
        ipcRenderer.send(ipcChannel.metadata.source),
}); //contextBridge.exposeInMainWorld

contextBridge.exposeInMainWorld(bridgeAPI.bridgeUI, {
    fullscreen: async onOff =>
        ipcRenderer.send(ipcChannel.ui.fullscreen, onOff),
    fullscreenToggle: () =>
        ipcRenderer.send(ipcChannel.ui.fullscreenToggle),
    subscribeToApplicationClose: request => {
        ipcRenderer.on(ipcChannel.ui.requestToIgnoreUnsavedData, _event => {
            ipcRenderer.send(ipcChannel.ui.requestToIgnoreUnsavedData, request());
        });
    }, //subscribeToApplicationClose
    showExternalUri: uri => ipcRenderer.send(ipcChannel.ui.showExternalUri, uri),
}); //contextBridge.exposeInMainWorld
