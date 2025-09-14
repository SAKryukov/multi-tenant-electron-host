"use strict";

const getDefinitionSet = () => {

    const definitionSet = {
        empty: "", blankSpace: " ", newLine: "\n",
        tabReplacement: " ".repeat(4),
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
            styleMenuItem: (item, group, error) => {
                if (group || error)
                    item.color = group ? "hsl(248, 53%, 20%, 100%)" : "red";
                item.opacity = 1;
                if (group)
                    item.fontWeight = "bold";
            }, //styleMenuItem
            normalizeFilename: filename => filename.replaceAll("\\", "/"),
            filenameFromURI: uri => uri.substring("file:///".length),
            errorStyle: `style="color: red"`,
            invalid: `Invalid plugin ${String.fromCharCode(0x2014)} click to see the explanation`,
            excepton: `Failed plugin registration ${String.fromCharCode(0x2014)} click to see the explanation.`,
            invalidExplanation: function (file, error) {
                const fileName = file == null ? "" : ` ${String.fromCharCode(0x201C)}${file}${String.fromCharCode(0x201D)}`;
                const errorText = error == null ? "" : `<br/><span ${this.errorStyle}>${error}</span><br/>`;
                return `<p style="color: red">Invalid plugin${fileName}</p>
                    ${errorText}
                    <br/>A valid plugin should register itself.
                    <br/>Please see ${String.fromCharCode(0x201C)}plugins.readme.md${String.fromCharCode(0x201D)}.<br/><br/>`;
            },
            exceptionExplanation: function (file, error) {
                const fileName = file == null ? "" : ` ${String.fromCharCode(0x201C)}${file}${String.fromCharCode(0x201D)}`;
                const errorText = error == null ? "" : `<br/><span ${this.errorStyle}>${error}</span><br/>`;
                const where = file ? " in the script" : "";
                return `<p style="color: red">Plugin registration failed${where}</p>
                    <p>${fileName}</p>
                    ${errorText}
                    <br/>`;
            },
            returnResult: function (name, theResult, error) {
                return `<p>${name}:</p><br/><span ${error ? this.errorStyle : this.empty}>${theResult}</span></br></br>`;
            },
            nameInMenu: name => `${name}`,
        },
        aboutDialog: metadata =>
            `<h4><img src="../images/editor.png"/>${metadata?.package?.description}</h4>
            <br/>Application version: ${metadata.applicationVersion}
            <br/>
            <br/>Platform: ${metadata.platform}
            <br/>CPU architecture: ${metadata.architecture}
            <br/>
            <br>Electron: v.&thinsp;${metadata.versions.electron}
            <br/>Chromium: v.&thinsp;${metadata.versions.chrome}
            <br/>Node.js: v.&thinsp;${metadata.versions.node}
            <br/>
            <br/>${metadata?.package?.metadata?.copyright}
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
            //custom:
            editorTextModified: 0,
        },
        keys: {
            KeyP: 0,
            KeyR: 0,
            Tab: 0,
        },
        elements: {
            script: 0, option: 0, section: 0, p: 0, span: 0, input: 0, br: 0, pre: 0, 
        },
        status: {
            modified: "Modified",
            cursorPosition: (text, offset) => {
                const lines = text.substring(0, offset).split("\n");
                const row = lines.length;
                const column = lines[lines.length-1].length + 1;
                return `${row}&thinsp;:&thinsp;${column}`;
            }, //cursorPosition
            line: (text, offset) => {
                const lines = text.substring(0, offset).split("\n");
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
                subscribeToReplaceConfirmation: function (element, handler) {
                    element.addEventListener(this.event.type, handler);
                }, //subscribeToReplaceConfirmation
                replacementPresentation: (text, findingStart, findingEnd) => {
                    let endOfLine = text.indexOf("\n", findingEnd);
                    if (endOfLine < 0) endOfLine = text.length - 1;
                    let startOfLine = text.lastIndexOf("\n", findingStart) + 1;
                    if (startOfLine < 0) startOfLine = 0;
                    return {
                        line: text.slice(startOfLine, endOfLine),
                        finding: [findingStart - startOfLine, findingEnd - startOfLine] };
                }, //replacementPresentation
                dialogMessageFormatLines: lines =>
                    lines.length == 2 && lines[0] != lines[1]
                        ? `lines ${lines[0]}-${lines[1]}`
                        : `line ${lines[0]}`,
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
