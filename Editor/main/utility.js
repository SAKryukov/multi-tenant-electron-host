"use strict";

module.exports.utilitySet = (() => {

    let definitionSet, BrowserWindow, dialog, fs, window, path, Menu;
    const utilitySet = {
        setup: values => {
            if (values.definitionSet) definitionSet = values.definitionSet;
            if (values.BrowserWindow) BrowserWindow = values.BrowserWindow;
            if (values.dialog) dialog = values.dialog;
            if (values.fs) fs = values.fs;
            if (values.path) path = values.path;
            if (values.window) window = values.window;
            if (values.Menu) Menu = values.Menu;
        }, //setup
        processCommandLine: fileSystem => {
            if (!fileSystem) fileSystem = fs; // this way, this function can be called with or without setup
            const filename = process.argv.length > 1
                ? process.argv[process.argv.length - 1]
                : null;
            if (!fileSystem.existsSync(filename)) return null;
            const lstat = fileSystem.statSync(filename);
            if (!lstat.isFile()) return null; // to prevent failure with the application directory passed to electron
            return filename;
        }, //processCommandLine
        openKnownFile: (filename, useData) => {
                fs.readFile(filename, {}, (error, data) =>
                    useData(data?.toString(), error));
        }, //openKnownFile
        openFile: (useData, defaultPath) => {
            dialog.showOpenDialog(window, { defaultPath, title: definitionSet.utility.fileDialog.titleOpenFile }).then(event => {
                if (event.canceled) return;
                fs.readFile(event.filePaths[0], {}, (error, data) =>
                    useData(event.filePaths[0], data?.toString(), error));            
            }); //dialog.showOpenDialog
        }, //openFile
        saveFileAs: (text, handler, defaultPath) => {
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
