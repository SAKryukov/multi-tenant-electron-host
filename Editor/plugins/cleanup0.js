"use strict";

const cleanupGroupIndent = 3;
pluginProcessor.registerPlugin({
    name: "Cleanup:",
    description: "Remove redundant blankspace characters, normalize file end",
    isEnabled: api => true,
});
