"use strict";

const definitionSet = {
    processApplicationName: {
        regex: /^\:(.*)$/g,
        wrap: name => `:${name}`,
        goodApplicationName: function(application) {
            const match = this.regex.exec(application);
            return match ? match[1] : null;
        },
        warn: function (name, tenantChoices) {
            name = name ? ` ${this.wrap(name)}`: "";
            console.warn(`Application${name} is not found`);
            console.warn(`Choose from the following names: ${tenantChoices.join(", ")}`);
        },
        showDefault: function(name) {
            console.warn(`Using default: ${this.wrap(name)}...`);
        }, //showDefault
    },
    paths: {
        package: "package.json",
        tenant: join => join("main", "tenant.js"),
    },
}; //definitionSet
Object.freeze(definitionSet);

if (exports)
    exports.definitionSet = definitionSet;
