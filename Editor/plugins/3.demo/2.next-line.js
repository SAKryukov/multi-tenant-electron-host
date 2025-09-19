"use strict";

pluginProcessor.registerPlugin({
    name: `Select Next Line (Meta+Alt+${String.fromCharCode(0x2193)})`,
    description: "Select next line",
    handler: api => {
        const point = api.nextLine;
        api.scrollTo(point[0], point[1]);
    },
    shortcut: { key: "ArrowDown", prefix: ["metaKey", "altKey"]},
    menuItemIndent: demoGroupIndent,
});
