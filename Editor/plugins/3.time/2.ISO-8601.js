"use strict";

({
    name: `ISO`,
    description: "Current time in the simplified ISO 8601 format",
    handler: api => {
        const time = new Date().toISOString();
        api.editor.setRangeText(api.newLine + time);
        api.isModified = true;
    }, //handler
    menuItemIndent: timeGroupIndent,
})
