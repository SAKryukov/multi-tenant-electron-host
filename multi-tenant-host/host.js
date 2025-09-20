"use strict";

const { definitionSet } = require("./definitionSet.js")
const { app } = require("electron");
const fs = require("fs");
const path = require("node:path");

const tenants = (() => {
    const applicationPath = app.getAppPath();
    const entries = fs.readdirSync(applicationPath);
    const result = new Map();
    const currentDirectory = process.cwd();
    for (const entry of entries) {
        const filename = path.join(applicationPath, entry);
        const packageFile = path.join(filename, definitionSet.paths.package);
        if (!fs.existsSync(packageFile)) continue;
        const tenantFile = path.join(filename, definitionSet.paths.tenant(path.join));
        if (!fs.existsSync(tenantFile)) continue;
        result.set(entry, tenantFile);
    } //loop
    process.chdir(currentDirectory);
    return result;
})();
const tenantChoices = (tenants => {
    const result = tenants.keys().toArray();
    for (let index in result)
        result[index] =
            definitionSet.processApplicationName.wrap(result[index]);
    return result;
})(tenants);

const applicationName = (() => {
    let result = null;
    for (const application of process.argv) {
        const name = definitionSet.processApplicationName.goodApplicationName(application);
        if (name) {
            result = name;
            break;
        } //if
    } //loop
    return result;
})();

const defaultApplicationName = tenants?.entries()?.next()?.value?.[0];
let effectiveApplicationName = applicationName;

if (!tenants.has(effectiveApplicationName)) {
    definitionSet.processApplicationName.warn(effectiveApplicationName, tenantChoices);
    effectiveApplicationName = defaultApplicationName;
    if (!effectiveApplicationName) return;
    definitionSet.processApplicationName.showDefault(defaultApplicationName);
} //if
require(tenants.get(effectiveApplicationName)).tenant(effectiveApplicationName);
