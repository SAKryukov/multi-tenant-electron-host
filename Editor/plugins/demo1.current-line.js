"use strict";

pluginProcessor.registerPlugin({
    name: `Select Current Line (Meta+Alt+Insert)`,
    description: "Select current line",
    handler: api => {
        const point = api.currentLines;
        api.scrollTo(point[0], point[1], true);
    },
    isEnabled: api => api.editor.textLength > 0,
    shortcut: { key: "Insert", prefix: ["metaKey", "altKey"]},
    menuItemIndent: demoGroupIndent,
});
