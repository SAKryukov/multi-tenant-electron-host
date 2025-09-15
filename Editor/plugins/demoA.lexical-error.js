"use strict";
??
pluginProcessor.registerPlugin({
    name: "Select Previous Word",
    description: "Select previous word",
    handler: api => {
        const point = api.previousWord;
        api.scrollTo(point[0], point[1], true);
    },
    menuItemIndent: demoGroupIndent,
});
