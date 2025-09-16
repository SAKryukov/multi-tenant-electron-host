"use strict";

pluginProcessor.registerPlugin({
    name: "Trim Line Ends",
    description: "Trim Line Ends",
    handler: api => {
        const oldLength = api.editor.textLength;
        const oldSelectionEnd = api.editor.selectionEnd; //SA???
        api.editor.value = api.editor.value.split(api.newLine)
            .map(line => line.trimEnd())
            .join(api.newLine);
        api.scrollTo(oldSelectionEnd, oldSelectionEnd, true); //SA???
        if (oldLength != api.editor.textLength)
            api.isModified = true;
    },
    isEnabled: () => true,
    menuItemIndent: cleanupGroupIndent,
});
