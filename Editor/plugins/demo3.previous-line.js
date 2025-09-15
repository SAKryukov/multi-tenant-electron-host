"use strict";

pluginProcessor.registerPlugin({
    name: "Select Previous Line",
    description: "Select previous line",
    handler: api => {
        const point = api.previousLine;
        api.scrollTo(point[0], point[1], true);
    },
    menuItemIndent: demoGroupIndent,
});
