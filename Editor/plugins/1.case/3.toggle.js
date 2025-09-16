"use strict";

pluginProcessor.registerPlugin({
    name: "Toggle",
    description: "Toggle selection case",
    handler: api => {
        const slice = api.editor.value.slice(api.editor.selectionStart, api.editor.selectionEnd);
        let newSlice = [];
        for (const letter of slice) {
            const isLow = letter.toLowerCase() == letter;
            newSlice.push(isLow ? letter.toUpperCase() : letter.toLowerCase());
        } //loop
        api.editor.setRangeText(newSlice.join(api.empty));
        api.isModified = true;
        api.scrollToSelection();
    },
    isEnabled: api => api.selectionLength > 0,
    menuItemIndent: caseGroupIndent,
});
