"use strict";

({
    name: "Normalize End of File",
    description: "Normalize end of file: trim and add a single new line",
    handler: api => {
        api.editor.value = api.editor.value.trimEnd() + api.newLine;
        api.isModified = true;
    },
    isEnabled: () => true,
    stayOnMenu: () => false,
    menuItemIndent: cleanupGroupIndent,
});
