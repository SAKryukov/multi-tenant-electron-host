"use strict";

({
    name: `Calculator`,

    description: "Calculate expression or function body in the selection.<br/>"
        + "In a function body, console object can be used:<br/>"
        + "&emsp;&emsp;console.clear(), console.log(),<br/>"
        + "&emsp;&emsp;and the like: debug, error, info, warn.",

    handler: api => {
        const codeReturn = "return";
        const codeArgument = "console";
        const insertPoint = api.editor.selectionEnd;
        let firstLine = true;

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

        let code = api.selectedText;
        if (code.indexOf(codeReturn) < 0)
            code = `${codeReturn} (${code});`;
        const script = new Function(codeArgument, code);
        api.scrollTo(api.editor.selectionEnd, api.editor.selectionEnd);
        api.editor.setRangeText(api.newLine + script(consoleApi) + api.newLine);
        api.scrollTo(insertPoint, insertPoint);
    }, //handler

    isEnabled: api => api.selectionLength > 0,

    menuItemIndent: demoGroupIndent,
});
