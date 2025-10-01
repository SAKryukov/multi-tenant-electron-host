"use strict";

const definitionSet = (() => {
    
    const definitionSetExtension = {
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
        editorAPI: {
            tabReplacement: " ".repeat(4),
            wordRegexString: "[0123456789\\w]+",
            newGlobalRegExp: function () { return new RegExp(this.wordRegexString, "g"); },
        }, //editorAPI
        plugin: {
            styleMenuItem: (item, group, error) => {
                if (group || error)
                    item.color = group ? "darkblue" : "red";
                item.opacity = 1;
                if (group)
                    item.fontWeight = "bold";
            }, //styleMenuItem
            fileUriToKey: (name, keyword) => name.slice(name.indexOf(keyword)).replaceAll("\\", "/"),
            errorStyle: `style="color: red"`,
            invalid: `Unregistered plugin ${String.fromCharCode(0x2014)} click to see the explanation`,
            excepton: `Failed plugin registration ${String.fromCharCode(0x2014)} click to see the explanation`,
            unregisteredExplanation: function (file, error) {
                const fileName = file == null ? "" : ` ${String.fromCharCode(0x201C)}${file}${String.fromCharCode(0x201D)}`;
                const errorText = error == null ? "" : `<br/><span ${this.errorStyle}>${error}</span><br/>`;
                return `<p><span ${this.errorStyle}>This plugin did not register itself:</span><br/>
                    <span>${fileName}</span></p>
                    ${errorText}
                    <br/>A valid plugin should register itself using
                    <br/><code style="font-family: monospace; font-size:140%; color: green">pluginProcessor.registerPlugin(pluginProperties)</code>.
                    <br/>Please see ${String.fromCharCode(0x201C)}plugins.readme.md${String.fromCharCode(0x201D)}.<br/><br/>`;
            },
            exceptionExplanation: function (file, error) {
                const fileName = file == null ? "" : ` ${String.fromCharCode(0x201C)}${file}${String.fromCharCode(0x201D)}`;
                const errorText = error == null ? "" : `<br/><span ${this.errorStyle}>${error}</span><br/>`;
                const where = file ? " in the script" : "";
                return `<p ${this.errorStyle}>Plugin registration failed${where}</p>
                    <p>${fileName}</p>
                    ${errorText}
                    <br/>`;
            },
            returnResult: function (name, theResult, error) {
                return `<p>${name}:</p><br/><span ${error ? this.errorStyle : this.character.empty}>${theResult}</span></br></br>`;
            },
            nameInMenu: name => `${name}`,
        }, //plugin
        defaultMessageDialog: {
            defaultButton: "Close",
        },
        fileDialog: {
            titleOpenFile: `Open text file${String.fromCharCode(0x2026)}`,
            titleSaveFile: `Save text file as${String.fromCharCode(0x2026)}`,
            titleSaveFileAndContinue: `Save text file as${String.fromCharCode(0x2026)} and continue`,
            titleSaveFileAndClose: `Save text file as${String.fromCharCode(0x2026)} and close application`,
        }, //fileDialog
        aboutDialog: metadata => {
            const hostVersionLine =
                metadata?.package?.applicationHostDescription
                    ? `<br/>${metadata.package.applicationHostDescription} version: ${metadata.applicationVersion}`
                    : "";
            return `<h4><img src="../images/editor.png"/>${metadata?.package?.description}</h4>
            <br/>Application version: ${metadata.package.version}
            ${hostVersionLine}
            <br/>
            <br/>Platform: ${metadata.platform}
            <br/>CPU architecture: ${metadata.architecture}
            <br/>
            <br>Electron: v.&thinsp;${metadata.versions.electron}
            <br/>Chromium: v.&thinsp;${metadata.versions.chrome}
            <br/>Node.js: v.&thinsp;${metadata.versions.node}
            <br/>
            <br/>${metadata?.package?.metadata?.copyright}
            <br/><br/>`
        }, //aboutDialog
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
            cursorPosition: (start, end) =>
                start == undefined
                    ? `${1}&thinsp;:&thinsp;${1}`
                    : ((start[0] == end[0] && start[1] == end[1])
                        ? `${start[0]}&thinsp;:&thinsp;${start[1]}`
                        : `<span style="background-color: blue; color: white">&thinsp;${start[0]}&thinsp;:&thinsp;${start[1]}&emsp;${String.fromCharCode(0x21D4)}&emsp;${end[0]}&thinsp;:&thinsp;${end[1]}&thinsp;</span>`),
            gravitySensor: {
                frequency: 10,
                permissionName: "accelerometer",
                permissionState: "granted",
                tilt: (x, y) => {
                    const angle = y == 0 ? 0 : Math.round(Math.atan(x / y) * 1800 / Math.PI) / 10;
                    return `${angle}${String.fromCharCode(0xB0)}`.replace("-", String.fromCharCode(0x2212));
                }, //tilt
            }, //gravitySensor
            line: (text, offset) => {
                const lines = text.substring(0, offset).split("\n");
                return lines.length;
            },
            macroRecording: "Recording macro&hellip; press Ctrl+Shift+R to stop",
            macroAvailable: "Macro is ready to play, press Ctrl+Shift+P",
            macroIndicatorAnimation: "blinker 0.9s ease-out infinite",
        }, //status
        macro: {
            specialInputTypeNewLine: { // ugly special case
                recorded: "insertLineBreak",
                replaced: "\n",
            },
            backspace: "deleteContentBackward", //for smart indentation
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
                element.style.display = doShow ? "inline" : "none",
        },
        search: {
            showInput: (element, doShow) =>
                element.style.display = doShow ? "inline" : "none",
            showButton: (element, doShow) =>
                element.style.display = doShow ? "inline-block" : "none",
            showLegend: (element, doShow) =>
                element.style.display = doShow ? "block" : "none",
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
                        finding: [findingStart - startOfLine, findingEnd - startOfLine]
                    };
                }, //replacementPresentation
                dialogMessageFormatLines: lines =>
                    lines.length == 2 && lines[0] != lines[1]
                        ? `lines ${lines[0]}-${lines[1]}`
                        : `line ${lines[0]}`,
            }, //replaceConfirmation
            regularExpressionException: (exception, editor) => showMessage(
                `<p style="color:red">Regular Expression Error:<br/><br/>${exception.toString()}</p><br/>`,
                editor
            ), //regularExpressionException
        }, //search
        menuShortcuts: {
            fileNew: { key: "KeyN", prefix: ["ctrlKey"] },
            fileOpen: { key: "KeyO", prefix: ["ctrlKey"] },
            fileSaveAs: { key: "KeyS", prefix: ["ctrlKey", "shiftKey"] },
            fileSaveExisting: { key: "KeyS", prefix: ["ctrlKey"] },
            helpAbout: { key: "F1", prefix: [] },
        }, //menuShortcuts
        isShortcut: (event, shortcut) => {
            if (event.code != shortcut.key) return false;
            if (!shortcut.prefix || shortcut.prefix.length < 1)
                return !(event.shiftKey || event.ctrlKey || event.metaKey || event.altKey);
            for (const prefixElement of shortcut.prefix)
                if (!event[prefixElement]) return false;
            return true;
        }, //isShortcut

    }; //definitionSetExtension

    namespaces.initializeNames([
        definitionSetExtension.elements,
        definitionSetExtension.keys,
        definitionSetExtension.search.optionClassName]);

    namespaces.extend(extensibleDefinitionSet, definitionSetExtension);

    return extensibleDefinitionSet;

})();
