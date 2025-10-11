"use strict";

({
    name: "Select Current Word (Meta+Alt+.)",
    description: "Select current word",
    handler: api => {
        const point = api.currentWord;
        api.scrollTo(point[0], point[1]);
    },
    shortcut: { keys: ["Period"], prefix: ["metaKey", "altKey"]},
    menuItemIndent: demoGroupIndent,
});
