"use strict";

const getDefinitionSet = () => {

    const definitionSet = {
        empty: "",
        SA: `<a href="https://www.SAKryukov.org">Sergey A Kryukov</a>`,
        copyright: function() {
            return `Copyright &copy; 2025 by ${this.SA}`
        },
        standaloneExecutionProtection: function() {
            const electron = `<a href="https://www.electronjs.org">Electron</a>`;
            document.body.innerHTML = `<aside>This HTML only works under ${electron}</aside>
            <p>Conceptual Electron Editor, ${this.copyright()}</p>`;
            window.stop();
        }, //standalongExecutionProtection
        plugin: {
            invalid: "Invalid plugin! Click to see the explanation",
            invalidExplanation: file =>
                `<p style="color: red">Invalid plugin ${String.fromCharCode(0x201C)}${file}${String.fromCharCode(0x201D)}</p>
                <br/>A valid plugin should register itself.
                <br/>Please see ${String.fromCharCode(0x201C)}plugins.readme.txt${String.fromCharCode(0x201D)}.<br/><br/>`,
            returnResult: (name, theResult) => `<p>${name}:</p><br/>${theResult}</br></br>`,
            nameInMenu: name => `${name}`,
        },
        aboutDialog: metadata =>
            `<h4><img src="../images/electron.png"/>${metadata?.package?.description}</h4>
            <br/>Application version: ${metadata.applicationVersion}
            <br>Electron: v.&thinsp;${metadata.versions.electron}
            <br/>Chromium: v.&thinsp;${metadata.versions.chrome}
            <br/>Node.js: v.&thinsp;${metadata.versions.node}
            <br/><br/>`,
        modifiedTextOperationConfirmation: {
            message: `<p>Do you want to save the changes?</p><br>
                <small>
                <p>The changes will be lost if you don't save them.</p>
                <p>You can save them now and repeat the operation later, or cancel.</p>
                </small>
                </br>`,
            messageClosingApplication: `<p>Do you want to save the changes before closing the application?</p><br>
                <small>
                <p>The changes will be lost if you don't save them.</p>
                <p>You can save them now and close the application later, or cancel.</p>
                </small>
                </br>`,
            buttons: (saveAction, dontSaveAction) => [
                { text: "Save", action: saveAction, },
                { text: "Don't Save", action : dontSaveAction },
                { isDefault: true, default: true, isEscape: true, text: "Cancel" }],
        }, //modifiedTextOperationConfirmation
        events: {
            DOMContentLoaded: 0,
            keydown: 0,
            selectionchange: 0,
            input: 0,
        },
        keys: {
            KeyP: 0,
            KeyR: 0,
        },
        elements: {
            script: 0,
            option: 0,
        },
        fileNaming: {
            title:  (baseFilename, originalTitle) =>
                `${baseFilename} ${String.fromCharCode(0x2014)} ${originalTitle}`,
        },
        status: {
            modified: "Modified",
            cursorPosition: (text, offset) => {
                const lines = text.substr(0, offset).split("\n");
                const row = lines.length;
                const column = lines[lines.length-1].length + 1;
                return `${row}&thinsp;:&thinsp;${column}`;
            }, //cursorPosition
            macroRecording: "Recording keyboard macro&hellip; press Ctrl+Shift+R to stop",
            macroAvailable: "Keyboard macro is ready to play, press Ctrl+Shift+P",
            macroIndicatorAnimation: "blinker 0.9s ease-out infinite",
        }, //status
        macro: {
            specialInputTypeNewLine: { // ugly special case
                recorded: "insertLineBreak", 
                replaced: "\n"
            },
        }, //macro
        errorHandling: {
            format: (errorKind, errorMessage) => `${errorKind}:<br/><br/><span style="color: red">${errorMessage}</span>`,
            save: "Save file error",
            open: "Open file error",
        },
        view: {
            statusBarStyle: visible => visible ? "flex" : "none",
        },
        search: {
            showElement: (element, doShow) =>
                element.style.display = doShow ? "inline"  : "none",
            shorcutFind: "KeyF",
            shorcutReplace: "KeyH",
            shorcutFindNext: "F3",
        }
    }; //definitionSet

    for (const subset of [definitionSet.events, definitionSet.elements, definitionSet.keys])
        for (const index in subset)
            if (!subset[index])
                subset[index] = index;
    Object.freeze(definitionSet);

    return definitionSet;

};
