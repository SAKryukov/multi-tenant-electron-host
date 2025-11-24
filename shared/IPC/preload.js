"use strict";
const { definitionSet } = require("../main/definition-set.js");
const { bridgeAPI, ipcChannel } = require("./ipc-channels.js");
const { ipcRenderer, contextBridge} = require("electron/renderer");
const { webFrame } = require('electron');
const fs = require("node:fs");
let acorn = null;
try {
    acorn = require("acorn");
} catch { }

let metadata = null;
ipcRenderer.once(ipcChannel.metadata.metadataPush, (_event, received) => metadata = received);

const zoom = (webFrame => {
    const minimumLevel = definitionSet.zoom.minimumLevel;
    const maximumLevel = definitionSet.zoom.maximumLevel;
    let currentLevel = 0;
    const reset = () => webFrame.setZoomLevel(0);
    reset();
    webFrame.setVisualZoomLevelLimits(minimumLevel, maximumLevel);
    webFrame.setZoomLevel(0);
    const canZoomIn = () => currentLevel < maximumLevel;
    const canZoomOut = () => currentLevel > minimumLevel;
    const zoomBy = increment => {
        if (increment > 0 && !canZoomIn()) return;
        if (increment < 0 && !canZoomOut()) return;
        currentLevel += increment;
        webFrame.setZoomLevel(currentLevel);
    }; //zoomBy
    const zoomIn = () => zoomBy(1);
    const zoomOut = () => zoomBy(-1);
    return { reset, canZoomIn, canZoomOut, zoomIn, zoomOut };
})(webFrame); //zoom

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
        ipcRenderer.once(ipcChannel.plugin.loadAll, (_event, plugins) => {
            handler(plugins);
        }),
    loadPlugin: (plugin, handler) => {
        const code = fs.readFileSync(plugin).toString();
        webFrame.executeJavaScript(code, false, (result, error) => handler(result, error));
    }, //loadPlugin
    validateCodeSyntax: code => {
        if (!code) return null;
        if (!acorn) return null;
        try {
            acorn.parse(code, { ecmaVersion: definitionSet.words.latest, locations: true });
        } catch (exception) {
            return {
                message: exception.message, location: exception.loc, position: exception.pos };
        } //exception
    }, //validateCodeSyntax
    isCodeSyntaxValidationEnabled: () =>  acorn != null,
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
    showExternalUri: (uri, errorHandler) => {
        ipcRenderer.send(ipcChannel.ui.showExternalUri, uri);
        ipcRenderer.once(ipcChannel.ui.showExternalUri, (_event, uri, error) => errorHandler?.(uri, error));
    }, //showExternalUri
    openLocalFile: (filename, relativeToApplicationPath, errorHandler) => {
        ipcRenderer.send(ipcChannel.ui.openLocalFile, filename, relativeToApplicationPath);
        ipcRenderer.once(ipcChannel.ui.openLocalFile, (_event, filename, error) => errorHandler?.(filename, error));
    }, //openLocalFile
    showInBrowserHelp: () =>
        ipcRenderer.send(ipcChannel.ui.showInBrowserHelp),
    canZoomIn: () => zoom.canZoomIn(),
    canZoomOut: () => zoom.canZoomOut(),
    zoomIn: () => zoom.zoomIn(),
    zoomOut: () => zoom.zoomOut(),
    zoomReset: () => zoom.reset(),
}); //contextBridge.exposeInMainWorld
