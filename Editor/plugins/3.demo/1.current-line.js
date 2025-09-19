"use strict";

pluginProcessor.registerPlugin({
    name: `Select Current Lines (Meta+Alt+Insert)`,
    description: "Select current line",
    handler: api => {
        const point = api.currentLines;
        api.scrollTo(point[0], point[1]);
    },
    isEnabled: api => api.editor.textLength > 0,
    shortcut: { key: "Insert", prefix: ["metaKey", "altKey"]},
    menuItemIndent: demoGroupIndent,
});
