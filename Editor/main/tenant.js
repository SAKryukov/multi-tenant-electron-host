"use strict";

module.exports.tenant = tenantRoot => {

    const { tenantBase } = require("../../shared/main/tenant-base.js");
    const { definitionSet } = require("./definition-set.js");
    const { pluginProvider } = require("./plugin-provider.js");

    // customization:
    tenantBase.paths.package = definitionSet.paths.package;
    tenantBase.paths.metadata = definitionSet.paths.metadata;
    tenantBase.paths.applicationIcon = definitionSet.paths.applicationIcon;
    tenantBase.paths.index = definitionSet.paths.index;
    tenantBase.pluginProvider = pluginProvider;

    tenantBase.run(tenantRoot);

};
