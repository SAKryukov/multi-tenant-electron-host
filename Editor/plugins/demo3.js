"use strict";

pluginProcessor.registerPlugin({
    name: "Select Current Word",
    description: "Select current word",
    handler: api => {
        const point = api.currentWord;
        api.scrollTo(point[0], point[1], true);
    },
    menuItemIndent: demoGroupIndent,
});