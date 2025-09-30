"use strict";

module.exports.tenant = tenantRoot => {

    let tenantBase;
    try {
        const candidate = require("../../shared/main/tenant-base.js");
        tenantBase = candidate.tenantBase;
    } catch {
        const { dialog, app } = require("electron");
        const path = require("node:path");
        const { definitionSet } = require("./definition-set.js");
        const applicationPath = app.getAppPath();
        const application = path.basename(applicationPath)
        dialog.showErrorBox(definitionSet.invalidApplicationPack.title,
            definitionSet.invalidApplicationPack.message);
        app.quit();
        return;
    } //exception

    const { definitionSet } = require("./definition-set.js");

    // customization:
    tenantBase.paths.package = definitionSet.paths.package;
    tenantBase.paths.metadata = definitionSet.paths.metadata;
    tenantBase.paths.applicationIcon = definitionSet.paths.applicationIcon;
    tenantBase.paths.index = definitionSet.paths.index;

    tenantBase.run(tenantRoot);

};
