"use strict";

(() => {

    const plugin = {
        name: `Default`,
        description: "Current time formatted by default",
        handler: api => {
            const time = new Date();
            const utc = time.toUTCString();
            api.editor.setRangeText(
                api.newLine + time + api.newLine + utc
            );
            api.isModified = true;
        }, //handler
        menuItemIndent: timeGroupIndent,
    }; //plugin

    return plugin;

})();
