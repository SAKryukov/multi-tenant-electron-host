"use strict";

const { ipcChannel } = require("../api/ipc-channels.js");
const { definitionSet } = require("../definition-set.js");
const { utilitySet } = require("./utility.js");
const { pluginProvider } = require("./plugin-provider.js");
const { app, dialog, BrowserWindow, Menu, ipcMain } = require('electron');
const fs = require('fs');
const path = require('node:path');
const shell = require('electron').shell;

const image = null;

const handlePlugins = (applicationPath, window) => {
    pluginProvider.setup({ definitionSet, fs, path, applicationPath, window });
    pluginProvider.sendScripts(ipcChannel.plugin.loadAll);
}; //handlePlugins

const applicationPackage = (() => {
    const packageFileName = path.join(app.getAppPath(), definitionSet.paths.package);
    if (fs.existsSync(packageFileName))
        return JSON.parse(fs.readFileSync(packageFileName));
})();

const title = applicationPackage?.description;

const subscribeToEvents = window => {
    ipcMain.handle(ipcChannel.metadata.request, async (_event) => {
        return {
            package: applicationPackage,
            versions: process.versions,
            applicationVersion: app.getVersion(),
            applicationName: app.name,
    }}); //metadata.request
    ipcMain.on(ipcChannel.metadata.source, () => {
        if (applicationPackage) {
            const source = applicationPackage.repository;
            if (source)
                shell.openExternal(source);
        } //if
    }); //metadata.source
    utilitySet.setup({ definitionSet, dialog, fs, window, image, app, process, });
    ipcMain.on(ipcChannel.fileIO.openFile, () => {
        utilitySet.openFile((filename, text, error) =>
            window.webContents.send(ipcChannel.fileIO.openFile, filename, path.basename(filename), text, error));
    });
    ipcMain.on(ipcChannel.fileIO.saveFileAs, (_event, text, closeApplication) => {
        utilitySet.saveFileAs(text, (filename, error) =>
            window.webContents.send(ipcChannel.fileIO.saveFileAs, filename, path.basename(filename), error));
        //if (closeApplication) //SA???
        //    window.close();
    });
    ipcMain.on(ipcChannel.fileIO.saveExistingFile, (_event, filename, text) => {
        utilitySet.saveExistingFile(filename, text, (filename, error) =>
            window.webContents.send(ipcChannel.fileIO.saveExistingFile, filename, path.basename(filename), error));
    });
    let isFullscreen = false;
    ipcMain.on(ipcChannel.ui.fullscreen, (_event, onOff) => {
         window.setFullScreen(onOff);
    });
    ipcMain.on(ipcChannel.ui.fullscreenToggle, _event => {
        isFullscreen = !isFullscreen;
         window.setFullScreen(isFullscreen);
    });
}; //subscribeToEvents

const handleCommandLine = window => {
    const filename = utilitySet.processCommandLine();
    if (filename)
        utilitySet.openKnownFile(filename, (text, error) =>
            window.webContents.send(
                ipcChannel.fileIO.openFromCommandLine,
                filename,
                path.basename(filename), text, error));
}; //handleCommandLine

const createWindow = () => {
    const applicationPath = app.getAppPath();
    const window = new BrowserWindow(
        definitionSet.createWindowProperties(title,
            path.join(applicationPath, definitionSet.paths.preload)));
    window.maximize(); //SA???
    window.once(definitionSet.events.readyToShow, () => {
        handlePlugins(applicationPath, window);
        handleCommandLine(window);
        window.show();
    }); //once ready to show
    let permittedToCloseApplication = false;
    window.on(definitionSet.events.close, event => {
        if (permittedToCloseApplication) return;
        window.webContents.send(ipcChannel.ui.requestToIgnoreUnsavedData);
        ipcMain.once(ipcChannel.ui.requestToIgnoreUnsavedData, (_event, response) => {
            if (response) {
                permittedToCloseApplication = true;
                window.close();
            } //if
        });
        event.preventDefault();
    }); //on close
    window.loadFile(path.join(applicationPath, definitionSet.paths.index));
    subscribeToEvents(window);
    Menu.setApplicationMenu(null);
}; //createWindow

app.whenReady().then(() => {
    createWindow();
    app.on(definitionSet.events.activate, () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
}); //app.whenReady

app.on(definitionSet.events.windowAllClosed, event => {
    if (!definitionSet.isDarwin(process))
        app.quit();
}); //app on window all closed
