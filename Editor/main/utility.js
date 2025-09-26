"use strict";

module.exports.utilitySet = (() => {

    const { definitionSet } = require("./definition-set.js");
    const { dialog, BrowserWindow, Menu } = require("electron");
    const fs = require("node:fs");
    const path = require("node:path");

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
        openFile: (window, useData, defaultPath) => {
            dialog.showOpenDialog(window, { defaultPath, title: definitionSet.utility.fileDialog.titleOpenFile }).then(event => {
                if (event.canceled) return;
                fs.readFile(event.filePaths[0], {}, (error, data) =>
                    useData(event.filePaths[0], data?.toString(), error));
            }); //dialog.showOpenDialog
        }, //openFile
        saveFileAs: (window, text, handler, defaultPath) => {
            dialog.showSaveDialog(window, { defaultPath, title: definitionSet.utility.fileDialog.titleSaveFile }).then(event => {
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
                        path.join(applicationPath, definitionSet.applicationIcon)));
                window.loadFile(path.join(applicationPath, definitionSet.invalidApplicationPack.pathHTML));
                Menu.setApplicationMenu(null);
            } //if
            return result;
        }, //handleInvalidApplicationPack
    }; //utilitySet

    return utilitySet;

})();
