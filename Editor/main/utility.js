module.exports.utilitySet = (() => {

    let definitionSet, dialog, fs, window, image, app, process;
    const utilitySet = {
        setup: values => {
            definitionSet = values.definitionSet;
            dialog = values.dialog;
            fs = values.fs;
            window = values.window;
            image = values.image;
            app = values.app;
            process = values.process;
        }, //setup
        processCommandLine: () => {
            const filename = process.argv.length > 1
                ? process.argv[process.argv.length - 1]
                : null;
            return fs.existsSync(filename)
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
        aboutBox: () =>
            dialog.showMessageBoxSync(window, {
                icon: image,
                //type: "info", //alternative to icon
                message:
                    `This application ${String.fromCharCode(0x201C)}${app.name}${String.fromCharCode(0x201D)}: ${app.getVersion()}\n` +
                    `Application location: ${app.getAppPath()}\n` +
                    "\n" +
                    `Platform: ${process.platform} ${process.arch}\n` +
                    "\n" +
                    `Electron path: ${process.argv0}\n` +
                    `Electron: ${process.versions.electron}\n` +
                    `Node.js: ${process.versions.node}\n` +
                    `Chrome: ${process.versions.chrome}\n` +
                    `JavaScript engine V8: ${process.versions.v8}\n` +
                    `Unicode: ${process.versions.unicode}`,
                title: definitionSet.utility.aboutDialog.title,
                buttons: definitionSet.utility.aboutDialog.buttons,
            }), //aboutBox
    }; //utilitySet

    return utilitySet;

})();


