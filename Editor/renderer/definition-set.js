"use strict";

const definitionSet = (() => {
    
    const definitionSetExtension = {
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
            exception: `Invalid plugin code ${String.fromCharCode(0x2014)} click to see the explanation`,
            unregisteredExplanation: function (file, error) {
                const fileName = file == null ? "" : ` ${String.fromCharCode(0x201C)}${file}${String.fromCharCode(0x201D)}`;
                const errorText = error == null ? "" : `<br/><span ${this.errorStyle}>${error}</span><br/>`;
                return `<p><span ${this.errorStyle}>Pluging registration failure:</span><br/>
                    <span>${fileName}</span></p>
                    ${errorText}
                    <br/>To register, a plugin should define the object
                    <br/><code style="font-family: monospace; font-size:140%; color: green">({ name, description, handler(api), isEnabled(api), shortcut, stayOnMenu(api), menuItemIndent });</code>
                    <br/>The property <code style="font-family: monospace; font-size:140%; color: green">name</code> is mandatory.
                    <br/><br/>Please see ${String.fromCharCode(0x201C)}plugins.readme.md${String.fromCharCode(0x201D)}.<br/><br/>`;
            },
            exceptionExplanation: function (file, error) {
                const fileName = file == null ? "" : ` ${String.fromCharCode(0x201C)}${file}${String.fromCharCode(0x201D)}`;
                const errorText = error == null ? "" : `<br/><span ${this.errorStyle}>${error.error}</span><br/>`;
                const where = file ? ` in`  : "";
                return `<p ${this.errorStyle}>Invalid syntax${where}</p>
                    <p>${fileName}</p>
                    <p>Line ${error.line}, column ${error.column}</p>
                    ${errorText}
                    <br/>`;
            },
            returnResult: function (name, theResult, error) {
                return `<p>${name}:</p><br/><span ${error ? this.errorStyle : ""}>${theResult}</span></br></br>`;
            },
            nameInMenu: name => `${name}`,
        }, //plugin
        fileDialog: {
            titleOpenFile: `Open text file`,
            titleSaveFile: `Save text file`,
            titleSaveFileAndContinue: `Save text file and continue`,
            titleSaveFileAndClose: `Save text file and quit application`,
        }, //fileDialog
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
            shortcutEscape: { key: "Escape", prefix: [] },
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
        paths: {
            image: "../images/editor.png",
        },
    }; //definitionSetExtension

    namespaces.initializeNames([
        definitionSetExtension.elements,
        definitionSetExtension.keys,
        definitionSetExtension.search.optionClassName]);

    namespaces.extend(extensibleDefinitionSet, definitionSetExtension);

    return extensibleDefinitionSet;

})();
