"use strict";

pluginProcessor.registerPlugin({
    name: "Select Next Word",
    description: "Select next word",
    handler: api => {
        const point = api.nextWord;
        api.scrollTo(point[0], point[1], true);
    },
    menuItemIndent: demoGroupIndent,
});
