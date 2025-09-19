"use strict";

pluginProcessor.registerPlugin({
    name: `Select Next Word (Meta+Alt+${String.fromCharCode(0x2192)})`,
    description: "Select next word",
    handler: api => {
        const point = api.nextWord;
        api.scrollTo(point[0], point[1]);
    },
    shortcut: { key: "ArrowRight", prefix: ["metaKey", "altKey"]},
    menuItemIndent: demoGroupIndent,
});
