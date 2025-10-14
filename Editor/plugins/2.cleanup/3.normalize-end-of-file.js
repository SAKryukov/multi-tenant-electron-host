"use strict";

({
    name: "Normalize End of File",
    description: "Normalize end of file: trim and add a single new line",
    handler: api => {
        const oldLength = api.editor.textLength;
        api.editor.value = api.editor.value.trimEnd() + api.newLine;
        if (oldLength != api.editor.textLength)
            api.isModified = true;
    },
    isEnabled: () => true,
    stayOnMenu: () => true,
    menuItemIndent: cleanupGroupIndent,
});
