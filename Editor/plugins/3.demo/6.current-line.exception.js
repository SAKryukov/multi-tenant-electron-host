"use strict";

pluginProcessor.registerPlugin({
    name: `Current Line ${String.fromCharCode(0x2014)} Exception Demo`,
    description: "Current Line demonstrates exception handling by the editor API",
    handler: api => {
        point = api.currentLines;
        api.scrollTo(point[0], point[1]);
    },
    isEnabled: api => api.editor.textLength > 0,
    menuItemIndent: demoGroupIndent,
});
