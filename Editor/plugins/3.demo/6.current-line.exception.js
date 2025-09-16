"use strict";

pluginProcessor.registerPlugin({
    name: "Current Line Under Development",
    description: "Current line under development demonstrates exception handling by the editor API",
    handler: api => {
        point = api.currentLines;
        api.scrollTo(point[0], point[1], true);
    },
    isEnabled: api => api.editor.textLength > 0,
    menuItemIndent: demoGroupIndent,
});
