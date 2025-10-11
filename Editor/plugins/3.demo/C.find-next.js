"use strict";

({
    name: "Find Next",
    description: "Find next occurrence of the found pattern",
    handler: api => api.findNext(),
    isEnabled: api => api.canFindNextPrevious,
    menuItemIndent: demoGroupIndent,
});
