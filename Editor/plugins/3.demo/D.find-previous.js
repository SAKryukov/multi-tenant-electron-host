"use strict";

pluginProcessor.registerPlugin({
    name: "Find Previous",
    description: "Find previous occurrence of the found pattern",
    handler: api => api.findPrevious(),
    isEnabled: api => api.canFindNextPrevious,
    menuItemIndent: demoGroupIndent,
});
