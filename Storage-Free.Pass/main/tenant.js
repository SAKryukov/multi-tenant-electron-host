"use strict";

module.exports.tenant = tenantRoot => {

    let tenantBase;
    try {
        const candidate = require("../../shared/main/tenant-base.js");
        tenantBase = candidate.tenantBase;
    } catch {
        const { dialog, app } = require("electron");
        const { definitionSet } = require("./definition-set.js");
        dialog.showErrorBox(definitionSet.invalidApplicationPack.title,
            definitionSet.invalidApplicationPack.message);
        app.quit();
        return;
    } //exception

    const { definitionSet } = require("./definition-set.js");
    const { pluginProvider } = require("./plugin-provider.js");

    // customization:
    tenantBase.paths.package = definitionSet.paths.package;
    tenantBase.paths.metadata = definitionSet.paths.metadata;
    tenantBase.paths.applicationIcon = definitionSet.paths.applicationIcon;
    tenantBase.paths.index = definitionSet.paths.index;
    tenantBase.pluginProvider = pluginProvider;
    tenantBase.useCommandLine = false;

    tenantBase.run(tenantRoot);

};
