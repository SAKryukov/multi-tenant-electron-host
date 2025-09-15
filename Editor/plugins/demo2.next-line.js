"use strict";

pluginProcessor.registerPlugin({
    name: "Select Next Line",
    description: "Select next line",
    handler: api => {
        const point = api.nextLine;
        api.scrollTo(point[0], point[1], true);
    },
    menuItemIndent: demoGroupIndent,
});
