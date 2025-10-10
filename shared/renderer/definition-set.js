"use strict";

const extensibleDefinitionSet = (() => {
    
    const definitionSet = {
        characters: {
            empty: "", blankSpace: " ", newLine: "\n",    
        }, //characters
        events: {
            DOMContentLoaded: 0,
            keydown: 0,
            click: 0,
            selectionchange: 0,
            input: 0,
            reading: 0, // Sensor: GravitySensor, Accelerometer...
            //custom:
            editorTextModified: 0,
        }, //events
        zoom: {
            shortcuts: {
                zoomIn: { keys: ["NumpadAdd", "Equal"], prefix: ["ctrlKey"] },
                zoomOut: { keys: ["NumpadSubtract", "Minus"], prefix: ["ctrlKey"] },
                zoomReset: { key: "Digit0", prefix: ["ctrlKey"] },
            },
        }, //zoom    
        menuShortcuts: {
            fileNew: { key: "KeyN", prefix: ["ctrlKey"] },
            fileOpen: { key: "KeyO", prefix: ["ctrlKey"] },
            fileSaveAs: { key: "KeyS", prefix: ["ctrlKey", "shiftKey"] },
            fileSaveExisting: { key: "KeyS", prefix: ["ctrlKey"] },
            helpAbout: { key: "F1", prefix: [] },
        }, //menuShortcuts
        isShortcut: (event, shortcut) => {
            if (shortcut.keys && !shortcut.keys.includes(event.code)
                || (shortcut.key && event.code != shortcut.key))
                    return false;
            if (!shortcut.prefix || shortcut.prefix.length < 1)
                return !(event.shiftKey || event.ctrlKey || event.metaKey || event.altKey);
            for (const prefixElement of shortcut.prefix)
                if (!event[prefixElement]) return false;
            return true;
        }, //isShortcut
        defaultMessageDialog: {
            defaultButton: "Close",
        },
        errorHandling: {
            format: (errorKind, errorMessage) => `${errorKind}:<br/><br/><span style="color: red">${errorMessage}<br/><br/></span>`,
            save: "Save file error",
            open: "Open file error",
            other: "Error",
        }, //errorHandling
        modifiedTextOperationConfirmation: {
            saveAsEvent: new Event("save-as"),
            saveExistingEvent: new Event("save-existing"),
            closeApplication: new Event("close-application"),
            message: `<p>Do you want to save the changes?</p><br>
                <small>
                <p>The changes will be lost if you don't save them.</p>
                <p>You can save them now, or cancel.</p>
                </small>
                </br>`,
            messageClosingApplication: `<p>Do you want to save the changes before closing the application?</p><br>
                <small>
                <p>The changes will be lost if you don't save them.</p>
                <p>You can save them now, or cancel.</p>
                </small>
                </br>`,
            buttons: (saveAction, dontSaveAction, cancelAction) => [
                { text: "Save", action: saveAction, },
                { text: "Don't Save", action: dontSaveAction },
                { isDefault: true, isEscape: true, text: "Cancel", action: cancelAction }],
        }, //modifiedTextOperationConfirmation        
        aboutDialog: (metadata, imagePath) => {
            const hostVersionLine =
                metadata?.package?.applicationHostDescription
                    ? `<br/>${metadata.package.applicationHostDescription} version: ${metadata.applicationVersion}`
                    : "";
            const copyright = metadata?.package?.metadata?.copyright
                ? `<br/> <br/>${metadata?.package?.metadata?.copyright}` : "";
            return `<h4> <img src="${imagePath}"/>${metadata?.package?.description}</h4>
            <br/>Application version: ${metadata.package.version}
            ${hostVersionLine}
            <br/>
            <br/>Platform: ${metadata.platform}
            <br/>CPU architecture: ${metadata.architecture}
            <br/>
            <br>Electron: v.&thinsp;${metadata.versions.electron}
            <br/>Chromium: v.&thinsp;${metadata.versions.chrome}
            <br/>Node.js: v.&thinsp;${metadata.versions.node}
            ${copyright}
            <br/><br/>`
        }, //aboutDialog        
        standaloneExecutionProtection: {
            copyright: "Copyright &copy; Sergey A Kryukov",
            url: "https://github.com/SAKryukov/conceptual-electron-editor",
            electron: "https://www.electronjs.org",
            show: function () {
                const electron = `<a href="${this.electron}">Electron</a>`;
                document.body.innerHTML = `<aside>This HTML only works under ${electron}</aside>
                <p><a href="${this.url}">Conceptual Electron Editor</a>, ${this.copyright}</p>`;
                window.stop();
            }, //show
        }, //standaloneExecutionProtection
    }; //definitionSet

    namespaces.initializeNames([ definitionSet.events, ]);

    return namespaces.create(definitionSet);

})();
