"use strict";

({
    name: `Calculator (Ctrl+F5)`,

    description: "Calculate expression or function body in the selection.<br/>"
        + "For output, use console.clear(), console.log() and/or return statement",

    handler: api => {
        const codeReturn = "return ";
        const codeArgument = "console";
        const jsonSpace = api.blankSpace.repeat(4);
        const startPoint = api.editor.selectionStart;
        const insertPoint = api.editor.selectionEnd;
        let firstLine = true;

        const replacementObject = object => { // precondition is: object && object instanceof Object
            if (object instanceof Array) {
                const length = object.length;
                if (length < 1)
                    return `${object.constructor.name}[]`;
                return `${object.constructor.name}[${length}]`;
            } else { //Object, Function is already excluded by the caller decircle
                const length = Object.keys(object).length;
                return length > 0
                    ? `${object.constructor.name} {${String.fromCharCode(0x2026)}}`
                    : `${object.constructor.name} {}`;
            } //if
        }; //replacementObject

        const stringify = object => {
            if (!(object instanceof Object))
                return object.toString();    
            const objectSet = new WeakSet();
            return JSON.stringify(object, (_key, value) => {
                if (value !== null && (value instanceof Function))
                    return value.toString().replaceAll(api.newLine, api.empty);
                else if (value !== null && (value instanceof Object)) {
                    if (objectSet.has(value))
                        return replacementObject(object);
                    objectSet.add(value);
                } //if
                return value;
            }, jsonSpace);
        }; //stringify

        const output = object => {
            if (!object) object = api.empty + object;
            const text =
                (firstLine ? api.newLine : api.empty)
                + stringify(object)
                + api.newLine;
            firstLine = false;
            const point = api.editor.selectionEnd; 
            api.scrollTo(point, point);
            api.editor.setRangeText(text);
            const newPoint = point + text.length;
            api.scrollTo(newPoint, newPoint);
        }; //output

        const clear = () => {
            api.editor.setSelectionRange(insertPoint, api.editor.textLength);
            api.editor.setRangeText(api.empty);
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
            try {
                const script = new Function(
                    ...globalObjects,
                    codeArgument,
                    `"use strict";` + api.newLine + code);
                return [script(...replacedGlobalObjects, consoleApi), null];
            } catch (error) {
                return [null, error];
            } //exception
        }; //runScript

        let code = api.selectedText;
        let functionError = undefined;
        let expressionError = undefined;
        let result = undefined;
        [result, expressionError] =
            runScript(codeReturn + `(${code.replace(/[;\s]+$/, api.empty)})`); // expression
        if (expressionError) //function
            [result, functionError] = runScript(code);
        if (expressionError && functionError) {
            if (functionError.message == expressionError.message)
                throw functionError;
            else
                throw new Error("<br/>Both function and expression error:" +
                    `<br/><br/>If code is interpreted as function body:<br/>${functionError.message}` +
                    `<br/><br/>If code is interpreted as expression:<br/>${expressionError.message}`);
        } else if (functionError) //SA???
            throw new Error(`<br/>Function error:<br/><br/>${functionError.message}`);
        api.scrollTo(api.editor.selectionEnd, api.editor.selectionEnd);
        output(result);
        api.scrollTo(startPoint, insertPoint);
        api.isModified = true;
    }, //handler

    isEnabled: api => api.selectionLength > 0,

    shortcut: { key: "F5", prefix: ["ctrlKey"]},
});
