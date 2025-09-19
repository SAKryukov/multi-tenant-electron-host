"use strict";

pluginProcessor.registerPlugin({
    name: `Select Previous Line (Meta+Alt+${String.fromCharCode(0x2191)})`,
    description: "Select previous line",
    handler: api => {
        const point = api.previousLine;
        api.scrollTo(point[0], point[1]);
    },
    shortcut: { key: "ArrowUp", prefix: ["metaKey", "altKey"]},
    menuItemIndent: demoGroupIndent,
});
