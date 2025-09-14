"use strict";

pluginProcessor.registerPlugin({
    name: "Select Current Line",
    description: "Select current line",
    handler: api => {
        const point = api.currentLines;
        api.scrollTo(point[0], point[1], true);
    },
    isEnabled: api => api.editor.textLength > 0,
    menuItemIndent: demoGroupIndent,
});
