"use strict";

const { ipcChannel } = require("../IPC/ipc-channels.js");
const { utilitySet } = require("./utility.js");
const { definitionSet } = require("./definition-set.js");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const tenantBase = {

    paths: { // has to be customized
        package: null, // mandatory
        index: null, // mandatory
        metadata: null, // optional (copyright won't show in the About dialog)
        applicationIcon: null, // optional
    }, //paths
    pluginProvider: null, // optional, has to be customized or left unimplemented

    run: function(tenantRoot) {

        tenantRoot = tenantRoot ?? String();

        let permittedToCloseApplication = false;

        const handlePlugins = (applicationPath, window) => {
            this.pluginProvider?.setup({ applicationPath, window });
            this.pluginProvider?.sendScripts(ipcChannel.plugin.loadAll);
        }; //handlePlugins

        const applicationPackage = (() => {
            const getJSON = (filename, host) => {
                if (!filename) return true;
                const fullName =
                    host
                        ? path.join(app.getAppPath(), filename)
                        : path.join(app.getAppPath(), tenantRoot, filename);
                if (fs.existsSync(fullName))
                    return JSON.parse(fs.readFileSync(fullName));
            }; //getJSON
            const packageJSON = getJSON(this.paths.package);
            const metadataJSON = getJSON(this.paths.metadata);
            packageJSON.metadata = metadataJSON;
            if (tenantRoot) {
                const hostApplicationPackage = getJSON(this.paths.package, true);
                packageJSON.applicationHostDescription = hostApplicationPackage.description;
            } else {
                const hostPackage = getJSON(definitionSet.paths.parentHostPackageName);
                packageJSON.applicationHostName = hostPackage.name;
                packageJSON.applicationHostDescription = hostPackage.description;
                packageJSON.applicationHostVersion = hostPackage.version;
            } //if
            return packageJSON;
        })(); //applicationPackage

        (() => { //redirect userData
            const originalUserDataPath = app.getPath(definitionSet.paths.userData);
            fs.rmSync(originalUserDataPath, { recursive: true, force: true });
            const newUserDataPath = tenantRoot
                ? path.join(originalUserDataPath, tenantRoot)
                : path.join(path.dirname(originalUserDataPath),
                    applicationPackage.applicationHostName,
                    path.basename(app.getAppPath()));
            app.setPath(definitionSet.paths.userData, newUserDataPath);
            applicationPackage.userDataDirectory = newUserDataPath;
        })(); //redirect userData

        const subscribeToEvents = (window, baseTitle) => {
            ipcMain.on(ipcChannel.metadata.source, () => {
                if (applicationPackage) {
                    const source = applicationPackage.repository;
                    if (source)
                        shell.openExternal(source);
                } //if
            }); //metadata.source
            ipcMain.on(ipcChannel.ui.showExternalUri, (_event, uri) => shell.openExternal(uri));
            ipcMain.on(ipcChannel.fileIO.openFile, (_event, dialogTitle, defaultPath, filters) => {
                utilitySet.openFile(window, (filename, text, error) => {
                    window.title = definitionSet.utility.fileNaming.title(path.basename(filename), baseTitle);
                    return window.webContents.send(ipcChannel.fileIO.openFile, filename, text, error);
                }, dialogTitle, defaultPath, filters);
            });
            const closeApplicationAfterSaving = (condition, error) => {
                if (condition && !error) {
                    permittedToCloseApplication = true;
                    window.close();
                } //if
            }; //closeApplicationAfterSaving
            ipcMain.on(ipcChannel.fileIO.saveFileAs, (_event, text, dialogTitle, defaultPath, filters, closeApplicationRequest) => {
                utilitySet.saveFileAs(window, text, (filename, error) => {
                    window.title = definitionSet.utility.fileNaming.title(path.basename(filename), baseTitle);
                    window.webContents.send(ipcChannel.fileIO.saveFileAs, filename, error);
                    closeApplicationAfterSaving(closeApplicationRequest, error);
                }, dialogTitle, defaultPath, filters);
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
            const applicationPath = app.getAppPath();
            const hostApplicationPath = tenantRoot
                ? app.getAppPath()
                : path.dirname(applicationPath);
            const tenantApplicationPath = tenantRoot
                ? path.join(hostApplicationPath, tenantRoot)
                : applicationPath;
            const icon = utilitySet.createApplicationIcon(tenantApplicationPath, this.paths.applicationIcon);
            const window = new BrowserWindow(
                definitionSet.createWindowProperties(title, icon,
                    path.join(hostApplicationPath, definitionSet.paths.preload)));
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
                handlePlugins(tenantApplicationPath, window);
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
            window.loadFile(path.join(tenantApplicationPath, this.paths.index));
            subscribeToEvents(window, baseTitle);
            Menu.setApplicationMenu(null);
        }; //createWindow

        app.whenReady().then(() => {
            const filename = utilitySet.processCommandLine();
            const baseTitle = applicationPackage?.description;
            const title = filename
                ? definitionSet.utility.fileNaming.title(path.basename(filename), baseTitle)
                : baseTitle
            createWindow(title, baseTitle, filename);
            app.on(definitionSet.events.activate, () => {
                if (BrowserWindow.getAllWindows().length === 0) createWindow(title);
            });
        }); //app.whenReady

        app.on(definitionSet.events.windowAllClosed, () => {
            if (!definitionSet.isDarwin(process))
                app.quit();
        }); //app on window all closed

    }, //run

}; //tenantBase

module.exports.tenantBase = tenantBase;
