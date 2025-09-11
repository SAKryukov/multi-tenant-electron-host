module.exports.utilitySet = (() => {

    let definitionSet, dialog, fs, window;
    const utilitySet = {
        setup: values => {
            definitionSet = values.definitionSet;
            dialog = values.dialog;
            fs = values.fs;
            window = values.window;
        }, //setup
        processCommandLine: fileSystem => {
            if (!fileSystem) fileSystem = fs; // this way, this function can be called with or without setup
            const filename = process.argv.length > 1
                ? process.argv[process.argv.length - 1]
                : null;
            return fileSystem.existsSync(filename)
                ? filename
                : null;
        }, //processCommandLine
        openKnownFile: (filename, useData) => {
                fs.readFile(filename, {}, (error, data) =>
                    useData(data?.toString(), error));
        }, //openKnownFile
        openFile: useData => {
            dialog.showOpenDialog(window, { title: definitionSet.utility.fileDialog.titleOpenFile }).then(event => {
                if (event.canceled) return;
                fs.readFile(event.filePaths[0], {}, (error, data) =>
                    useData(event.filePaths[0], data?.toString(), error));            
            }); //dialog.showOpenDialog
        }, //openFile
        saveFileAs: (text, handler) => {
            dialog.showSaveDialog(window, { title: definitionSet.utility.fileDialog.titleSaveFile }).then(event => {
                if (event.canceled) return;
                fs.writeFile(event.filePath, text, {}, error =>
                    handler(event.filePath, error));
            }); //dialog.showOpenDialog
        }, //saveFileAs
        saveExistingFile: (filenane, text, handler) => {
                fs.writeFile(filenane, text, {}, error =>
                    handler(filenane, error));
        }, //saveExistingFile
    }; //utilitySet

    return utilitySet;

})();
