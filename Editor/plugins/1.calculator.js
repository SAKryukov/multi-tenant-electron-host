"use strict";

({
    name: `Calculator (Ctrl+F5)`,

    description: "Calculate expression or function body in the selection.<br/>"
        + "For output, use console.clear(), console.log() and/or return statement.<br/>"
        + "If console was not used and return is undefined<br/>"
        + "&emsp;&emsp;the code will be interpreted as an expression.",

    handler: api => {
        const codeReturn = "return";
        const codeArgument = "console";
        const startPoint = api.editor.selectionStart;
        const insertPoint = api.editor.selectionEnd;
        let firstLine = true;
        let consoleUsed = false;

        //throw new Error(`<p>Object <code style="color: green">window</code> cannot be used in the Calculator code</p>`);

        const output = object => {
            if (!object) return;
            const text =
                (firstLine ? api.newLine : api.empty)
                + object.toString()
                + api.newLine;
            firstLine = false;
            const point = api.editor.selectionEnd; 
            api.scrollTo(point, point);
            api.editor.setRangeText(text);
            const newPoint = point + text.length;
            api.scrollTo(newPoint, newPoint);
            consoleUsed = true;
        }; //output

        const clear = () => {
            api.editor.setSelectionRange(insertPoint, api.editor.textLength);
            api.editor.setRangeText(api.empty);
            consoleUsed = true;
        }; //clear

        const consoleApi = {
            clear: clear, 
            debug: output,
            error: output,
            info: output,
            log: output,
            warn: output,
        }; //consoleApi

        const globalObjects = Object.keys(window);
        const replacedGlobalObjects = Array(globalObjects.length).fill(undefined);
        const runScript = code => {
            const script = new Function(
                ...globalObjects,
                codeArgument,
                `"use strict";` + api.newLine + code);
            return script(...replacedGlobalObjects, consoleApi);
        }; //runScript

        let code = api.selectedText;
        let result = runScript(code);
        if ((!consoleUsed) && result === undefined) { //expression
            code = `${codeReturn} (${code});`;
            result = runScript(code);
        } //if expression
        if (result === undefined)
            result = api.empty;
        api.scrollTo(api.editor.selectionEnd, api.editor.selectionEnd);
        api.editor.setRangeText(api.newLine + result + api.newLine);
        api.scrollTo(startPoint, insertPoint);
    }, //handler

    isEnabled: api => api.selectionLength > 0,

    shortcut: { key: "F5", prefix: ["ctrlKey"]},
});
