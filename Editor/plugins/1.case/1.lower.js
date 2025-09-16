"use strict";

pluginProcessor.registerPlugin({
    name: "Lower (F4)",
    description: "Change selection case to lower",
    handler: api => {
        const slice = api.editor.value.slice(api.editor.selectionStart, api.editor.selectionEnd).toLowerCase();
        api.editor.setRangeText(slice);
        api.isModified = true;
        api.scrollToSelection();
    },
    isEnabled: api => api.selectionLength > 0,
    shortcut: { key: "F4", prefix: []},
    menuItemIndent: caseGroupIndent,
});
