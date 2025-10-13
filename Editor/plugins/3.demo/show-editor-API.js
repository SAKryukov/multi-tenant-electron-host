"use strict";

({
    name: `Show Editor API`,
    description: "Show editor API as editor text",
    showAPI: (api, newLine) => {
        const keys = {
            arrow: "=>",
            brackets: ["(", ")"],
            function: "function",
            inBrackets: content => `(${content})`,
        };
        const apiItems = [];
        for (let index in api) {
            let name = index;
            if (api[index] instanceof Function) {
                const code = api[index].toString();
                const arrow = code.indexOf(keys.arrow);
                if (arrow >=0) {
                    const argumentPart = code.substring(0, arrow).trim();
                    name += argumentPart.indexOf(keys.brackets[0]) >= 0
                        ? argumentPart
                        : keys.inBrackets(argumentPart);
                } else { // function
                    const functionWord = code.indexOf(keys.function);
                    if (functionWord >= 0) {
                        const functionContent = code.slice(functionWord);
                        const argumentPart = functionContent.slice(0, functionContent.indexOf(keys.brackets[1]) + 1);
                        name += argumentPart;
                    } //if
                } //if
            } //loop
            apiItems.push(name);
        } //loop
        return apiItems.join(newLine);
    }, //showAPI
    handler: function(api) {
        const editorAPI = this.showAPI(api, api.newLine);
        const pluginAPI = this.showAPI(api.pluginAPI, api.newLine);
        api.editor.value = `Editor API:\n\n${editorAPI}\n\nPlugin API:\n\n${pluginAPI}\n`;
        api.isModified = true;
    }, //handler
    isEnabled: api => true,
    menuItemIndent: demoGroupIndent,
});
