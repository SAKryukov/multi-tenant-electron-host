"use strict";

({
    name: "Find Previous",
    description: "Find previous occurrence of the found pattern",
    handler: api => { api.findPrevious(); return undefined; },
    isEnabled: api => api.canFindNextPrevious,
    menuItemIndent: demoGroupIndent,
});
