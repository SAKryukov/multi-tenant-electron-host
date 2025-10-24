"use strict";

({
    name: "Show Global Objects",
    description: "Show all global objects",
    handler: api => {
        const getGlobalObjects = () => {
            let currentPrototype = globalThis;
            const prototypes = [];
            do {
                const prototypeData = { Object: `${currentPrototype.constructor.name}`, properties: [], };
                prototypes.push(prototypeData);
                const propertyNames = Object.getOwnPropertyNames(currentPrototype);
                for (const name of propertyNames) {
                    try {
                        const value = currentPrototype[name];
                        if (value != null)
                            prototypeData.properties.push(`${name}: ${value.constructor.name}`);
                    } catch (e) {
                        console.log(`${name}: ${e.Message}`);
                    }
                } //loop
                currentPrototype = Object.getPrototypeOf(currentPrototype);
            } while (currentPrototype);
            const filteredPrototypes = prototypes.filter(item => item.properties.length > 0);
            return (JSON.stringify(filteredPrototypes, null, api.defaultIndent));
        } //getGlobalObjects
        api.editor.value = getGlobalObjects();
        api.isModified = true;
    },
    isEnabled: () => true,
    menuItemIndent: demoGroupIndent,
});
