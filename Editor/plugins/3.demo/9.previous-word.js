"use strict";

({
    name: `Select Previous Word (Meta+Alt+${String.fromCharCode(0x2190)})`,
    description: "Select previous word",
    handler: api => {
        const point = api.previousWord;
        api.scrollTo(point[0], point[1]);
    },
    shortcut: { key: "ArrowLeft", prefix: ["metaKey", "altKey"]},
    menuItemIndent: demoGroupIndent,
});
