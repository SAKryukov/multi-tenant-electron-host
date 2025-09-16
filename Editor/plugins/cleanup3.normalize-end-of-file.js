"use strict";

pluginProcessor.registerPlugin({
    name: "Normalize End of File",
    description: "Normalize end of file: trim and add a single new line",
    handler: api => {
        api.editor.value = api.editor.value.replace(/^\s+|\s+$/g, '') + api.newLine;
        api.isModified = true;
    },
    isEnabled: () => true,
    menuItemIndent: cleanupGroupIndent,
});
