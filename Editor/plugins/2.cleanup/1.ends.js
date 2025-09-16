"use strict";

pluginProcessor.registerPlugin({
    name: "Trim Line Ends",
    description: "Trim Line Ends",
    handler: api => {
        const oldLength = api.editor.textLength;
        api.pushSelection();
        api.editor.value = api.editor.value.split(api.newLine)
            .map(line => line.trimEnd())
            .join(api.newLine);
        api.popSelection(true);
        if (oldLength != api.editor.textLength)
            api.isModified = true;
    },
    isEnabled: () => true,
    menuItemIndent: cleanupGroupIndent,
});
