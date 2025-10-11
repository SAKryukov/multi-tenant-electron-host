"use strict";

({
    name: "Upper (Shift+F4)",
    description: "Change selection case to upper",
    handler: api => {
        const slice = api.editor.value.slice(api.editor.selectionStart, api.editor.selectionEnd).toUpperCase();
        api.editor.setRangeText(slice);
        api.isModified = true;
        api.scrollToSelection();
    },
    isEnabled: api => api.selectionLength > 0,
    shortcut: { key: "F4", prefix: ["shiftKey"]},
    menuItemIndent: caseGroupIndent,
});
