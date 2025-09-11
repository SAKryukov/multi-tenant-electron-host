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
            `<h4><img src="../images/editor.png"/>${metadata?.package?.description}</h4>
            <br/>Application version: ${metadata.applicationVersion}
            <br>Electron: v.&thinsp;${metadata.versions.electron}
            <br/>Chromium: v.&thinsp;${metadata.versions.chrome}
            <br/>Node.js: v.&thinsp;${metadata.versions.node}
            <br/><br/>`,
        modifiedTextOperationConfirmation: {
            saveAsEvent: new Event("save-as"),
            saveExistingEvent: new Event("save-existing"),
            closeApplication: new Event("close-application"),
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
                { isDefault: true, isEscape: true, text: "Cancel" }],
        }, //modifiedTextOperationConfirmation
        events: {
            DOMContentLoaded: 0,
            keydown: 0,
            selectionchange: 0,
            input: 0,
            //custom
        },
        keys: {
            KeyP: 0,
            KeyR: 0,
        },
        elements: {
            script: 0, option: 0, section: 0, p: 0, span: 0, input: 0, br: 0,
        },
        status: {
            modified: "Modified",
            cursorPosition: (text, offset) => {
                const lines = text.substr(0, offset).split("\n");
                const row = lines.length;
                const column = lines[lines.length-1].length + 1;
                return `${row}&thinsp;:&thinsp;${column}`;
            }, //cursorPosition
            line: (text, offset) => {
                const lines = text.substr(0, offset).split("\n");
                return lines.length;
            },
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
        }, //errorHandling
        view: {
            statusBarStyle: visible => visible ? "flex" : "none",
            textWrapStyle: wrap => wrap ? "stable" : "nowrap",
        },
        ui: {
            showInline: (element, doShow) =>
                element.style.display = doShow ? "inline"  : "none",
        },
        search: {
            showInput: (element, doShow) =>
                element.style.display = doShow ? "inline"  : "none",
            showButton: (element, doShow) =>
                element.style.display = doShow ? "inline-block"  : "none",
            showLegend: (element, doShow) =>
                element.style.display = doShow ? "block"  : "none",
            specialCharacterReplacements: [
                ["\\\\", "\\"],
                ["\\n", "\n"],
                ["\\t", "\t"],
                ["\\---", String.fromCharCode(0x2014)], //em dash, order is important!
                ["\\--", String.fromCharCode(0x2013)], //en dash
                ["\\(", String.fromCharCode(0x018)], //left single quotation mark
                ["\\)", String.fromCharCode(0x019)], //right single quotation mark
                ["\\[", String.fromCharCode(0x201C)], //left double quotation mark
                ["\\]", String.fromCharCode(0x201D)], //right double quotation mark
                ["\\<<", String.fromCharCode(0x00AB)], //left angle quotation mark
                ["\\>>", String.fromCharCode(0x00BB)], //right angle quotation mark
            ], //specialCharacterReplacements
            regularExpressionFlags: (ignoreCase, global) => {
                const globalIndicator = global ? "g" : "";
                const caseIndicator = ignoreCase ? "i" : "";
                return `${globalIndicator}u${caseIndicator}`;
            }, //regularExpressionFlags
            regularExpressionWholeWord: word => `\\b${word}\\b`,
            shorcutFind: { key: "KeyF", prefix: ["ctrlKey"] },
            shorcutReplace: { key: "KeyH", prefix: ["ctrlKey"] },
            shorcutFindNext: { key: "F3", prefix: [] },
            shorcutFindPrevious: { key: "F3", prefix: ["shiftKey"] },
            shorcutClose: { key: "F4", prefix: ["ctrlKey"] },
            shorcutPerform: { key: "Enter", prefix: [] },
            optionClassName: { up: 0, down: 0, },
            replaceConfirmation: {
                event: new Event("replace-confirmation"),
                subscribeToReplaceConfirmation: function(element, handler) {
                    element.addEventListener(this.event.type, handler);
                }, //subscribeToReplaceConfirmation
                dialogMessageFormatLines: lines => 
                    lines.length == 2
                        ? `lines ${lines[0]}-${lines[1]}`
                        : `line ${lines}`,
                dialogMessage: (line, lineNumber) => `<p>Found in line ${lineNumber}:</p>
                    ${line}
                    <br/><br/>
                    <p style="text-align: center">Replace?</a><br/><br/>`,
                dialogButtons: (yesAction, noAction, breakAction) => [
                    { text: "Yes", isDefault: true, action: yesAction, },
                    { text: "No", action: noAction, },
                    { text: "Complete Replacements", action: breakAction, },
                    { default: true, isEscape: true, text: "Cancel All Replacements" }
                ],
                formatLineToReplace: (text, findingStart, findingEnd) => {
                    let lines = text.substr(0, findingStart).split("\n");
                    const row = lines.length;
                    const column = lines[lines.length - 1].length + 1;
                    const start = findingStart - column + 1;
                    lines = text.split("\n");
                    const source = lines[row - 1];
                    const partOne = source.slice(0, findingStart - start);
                    const partTwo = source.slice(findingStart - start, findingEnd - start);
                    const partThree = source.substring(findingEnd - start);
                    return `<p style="color: blue">${partOne}<b style="color: white; background-color: blue">${partTwo}</b>${partThree}</p`;
                }, //formatLineToReplace
            }, //replaceConfirmation
        }, //search
        isShortcut : (event, shortcut) => {
            if (event.code != shortcut.key) return false;
            if (!shortcut.prefix || shortcut.prefix.length < 1)
                return !(event.shiftKey || event.ctrlKey || event.metaKey || event.altKey);
            for (const prefixElement of shortcut.prefix) 
                if (!event[prefixElement]) return false;
            return true;
        }, //isShortcut
    }; //definitionSet

    for (const subset of [definitionSet.events, definitionSet.elements, definitionSet.keys, definitionSet.search.optionClassName])
        for (const index in subset)
            if (!subset[index])
                subset[index] = index;
    Object.freeze(definitionSet);

    return definitionSet;

};
