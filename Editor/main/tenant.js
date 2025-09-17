"use strict";

module.exports.tenant = tenantRoot => {

    const { ipcChannel } = require("../api/ipc-channels.js");
    const { definitionSet } = require("./definition-set.js");
    const { utilitySet } = require("./utility.js");
    const { pluginProvider } = require("./plugin-provider.js");
    const { app, dialog, BrowserWindow, Menu, ipcMain, nativeImage } = require('electron');
    const fs = require('fs');
    const path = require('node:path');
    const shell = require('electron').shell;

    let permittedToCloseApplication = false;

    const handlePlugins = (applicationPath, window) => {
        pluginProvider.setup({ definitionSet, fs, path, applicationPath, window });
        pluginProvider.sendScripts(ipcChannel.plugin.loadAll);
    }; //handlePlugins

    const applicationPackage = (() => {
        const getJSON = filename => {
            const fullName = path.join(app.getAppPath(), tenantRoot, filename);
            if (fs.existsSync(fullName))
                return JSON.parse(fs.readFileSync(fullName));
        };
        const packageJSON = getJSON(definitionSet.paths.package);
        const metadataJSON = getJSON(definitionSet.paths.metadata);
        packageJSON.metadata = metadataJSON;
        return packageJSON;
    })(); //applicationPackage

    const subscribeToEvents = (window, baseTitle) => {
        ipcMain.on(ipcChannel.metadata.source, () => {
            if (applicationPackage) {
                const source = applicationPackage.repository;
                if (source)
                    shell.openExternal(source);
            } //if
        }); //metadata.source
        utilitySet.setup({ definitionSet, dialog, fs, window });
        ipcMain.on(ipcChannel.fileIO.openFile, (event_, defaultPath) => {
            utilitySet.openFile((filename, text, error) => {
                window.title = definitionSet.utility.fileNaming.title(path.basename(filename), baseTitle);
                return window.webContents.send(ipcChannel.fileIO.openFile, filename, text, error);
            }, defaultPath);
        });
        const closeApplicationAfterSaving = (condition, error) => {
            if (condition && !error) {
                permittedToCloseApplication = true;
                window.close();
            } //if
        }; //closeApplicationAfterSaving
        ipcMain.on(ipcChannel.fileIO.saveFileAs, (_event, text, defaultPath, closeApplicationRequest) => {
            utilitySet.saveFileAs(text, (filename, error) => {
                window.title = definitionSet.utility.fileNaming.title(path.basename(filename), baseTitle);
                window.webContents.send(ipcChannel.fileIO.saveFileAs, filename, error);
                closeApplicationAfterSaving(closeApplicationRequest, error);
            }, defaultPath);
        });
        ipcMain.on(ipcChannel.fileIO.saveExistingFile, (_event, filename, text, closeApplicationRequest) => {
            utilitySet.saveExistingFile(filename, text, (filename, error) => {
                window.webContents.send(ipcChannel.fileIO.saveExistingFile, filename, error);
                closeApplicationAfterSaving(closeApplicationRequest, error);
            });
        });
        ipcMain.on(ipcChannel.fileIO.resetApplicationTitle, _event => window.title = baseTitle);
        ipcMain.on(ipcChannel.fileIO.closeApplication, _event => {
            permittedToCloseApplication = true;
            window.close();
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

    const handleCommandLine = (window, filename) => {
        if (filename)
            utilitySet.openKnownFile(filename, (text, error) =>
                window.webContents.send(
                    ipcChannel.fileIO.openFromCommandLine,
                    filename,
                    text, error));
    }; //handleCommandLine

    const createWindow = (title, baseTitle, filename) => {
        const applicationPath = path.join(app.getAppPath(), tenantRoot);
        const icon = nativeImage.createFromPath(path.join(applicationPath, definitionSet.applicationIcon));
        const window = new BrowserWindow(
            definitionSet.createWindowProperties(title, icon,
                path.join(applicationPath, definitionSet.paths.preload)));
        window.webContents.send(ipcChannel.metadata.metadataPush, {
            platform: process.platform,
            architecture: process.arch,
            package: applicationPackage,
            versions: process.versions,
            applicationVersion: app.getVersion(),
            applicationName: app.name,
        });
        window.maximize(); //SA???
        window.once(definitionSet.events.readyToShow, () => {
            handlePlugins(applicationPath, window);
            handleCommandLine(window, filename);
            window.show();
        }); //once ready to show
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
        subscribeToEvents(window, baseTitle);
        Menu.setApplicationMenu(null);
    }; //createWindow

    app.whenReady().then(() => {
        const filename = utilitySet.processCommandLine(fs);
        const baseTitle = applicationPackage?.description;
        const title = filename
            ? definitionSet.utility.fileNaming.title(path.basename(filename), baseTitle)
            : baseTitle
        createWindow(title, baseTitle, filename);
        app.on(definitionSet.events.activate, () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow(title);
        });
    }); //app.whenReady

    app.on(definitionSet.events.windowAllClosed, event => {
        if (!definitionSet.isDarwin(process))
            app.quit();
    }); //app on window all closed

};
