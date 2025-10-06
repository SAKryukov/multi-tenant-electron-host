"use strict";

module.exports.utilitySet = (() => {

    const { dialog, BrowserWindow, Menu, nativeImage } = require("electron");
    const fs = require("node:fs");
    const path = require("node:path");

    const definitionSet = {
        invalidApplicationPack: {
            isInvalid: applicationPath => applicationPath.endsWith("app.asar"),
            createWindowProperties: icon => {
                return {
                    title: "Invalid application pack",
                    resizable: true,
                    icon: icon,
                };
            }, //createInvalidPackMessageWindowProperties
            pathHTML: "renderer/invalid-pack.html",
        }, //invalidApplicationPack
    }; //definitionSet

    const utilitySet = {
        processCommandLine: () => {
            const filename = process.argv.length > 1
                ? process.argv[process.argv.length - 1]
                : null;
            if (!fs.existsSync(filename)) return null;
            // to prevent failure with the application directory passed to electron:
            if (!fs.statSync(filename).isFile()) return null;
            return filename;
        }, //processCommandLine
        openKnownFile: (filename, useData) => {
                fs.readFile(filename, {}, (error, data) =>
                    useData(data?.toString(), error));
        }, //openKnownFile
        openFile: (window, useData, title, defaultPath, filters) => {
            // we assume defaultPath is actually a filename:
            dialog.showOpenDialog(window, { defaultPath: path.dirname(defaultPath), filters, title }).then(event => {
                if (event.canceled) return;
                fs.readFile(event.filePaths[0], {}, (error, data) =>
                    useData(event.filePaths[0], data?.toString(), error));
            }); //dialog.showOpenDialog
        }, //openFile
        saveFileAs: (window, text, handler, title, defaultPath, filters) => {
            // we assume defaultPath is actually a filename:
            dialog.showSaveDialog(window, { defaultPath: path.dirname(defaultPath), filters, title }).then(event => {
                if (event.canceled) return;
                fs.writeFile(event.filePath, text, {}, error =>
                    handler(event.filePath, error));
            }); //dialog.showOpenDialog
        }, //saveFileAs
        saveExistingFile: (filenane, text, handler) => {
                fs.writeFile(filenane, text, {}, error =>
                    handler(filenane, error));
        }, //saveExistingFile
        handleInvalidApplicationPack: app => {
            const applicationPath = app.getAppPath();
            const result = definitionSet.invalidApplicationPack.isInvalid(applicationPath);
            if (result) {
                const window = new BrowserWindow(
                    definitionSet.invalidApplicationPack.createWindowProperties(
                        undefined));
                window.loadFile(path.join(applicationPath, definitionSet.invalidApplicationPack.pathHTML));
                Menu.setApplicationMenu(null);
            } //if
            return result;
        }, //handleInvalidApplicationPack
        createApplicationIcon: (tenantApplicationPath, iconFileName) => {
            if (!iconFileName) return null;
            const absoluteFileName = path.join(tenantApplicationPath, iconFileName);
            if (!fs.existsSync(absoluteFileName)) return null;
            return nativeImage.createFromPath(absoluteFileName);
        }, //createApplicationIcon
    }; //utilitySet

    return utilitySet;

})();
