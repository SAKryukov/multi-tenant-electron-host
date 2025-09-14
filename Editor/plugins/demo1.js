"use strict";
bad = 3;
pluginProcessor.registerPlugin({
    name: "Select current Line",
    description: "Select current Line",
    handler: api => {
        const point = api.currentLines;
        api.scrollTo(point[0], point[1], true);
    },
    isEnabled: api => api.editor.textLength > 0,
    menuItemIndent: 3,
});
