"use strict";

const { definitionSet } = require("./definition-set.js");

function CommandLine(options) {

    const metadataMap = new Map();
    const optionMap = new Map();
    const files = [];
    const unrecognizedOptions = [];
    const duplicateOptions = [];

    for (const index in options) {
        options[index].key = index;
        metadataMap.set(index, options[index]);
        if (options[index].abbreviation) {
            const abbreviation = index.slice(0, options[index].abbreviation);
            metadataMap.set(abbreviation, options[index]);
        } //if
    } //loop

    const propertyHandler = {
        get (_target, property, _receiver) { 
            const value = optionMap.get(property);
            return optionMap.get(property);
        }
    } //propertyHandler
    this.option = new Proxy(this, propertyHandler);

    const reset = () => {
        optionMap.clear();
        files.length = 0;
        unrecognizedOptions.length = 0;
        duplicateOptions.length = 0;
    } //reset

    this.parse = startFrom => {
        if (startFrom == null) startFrom = 0;
        if (startFrom.constructor != Number || startFrom < 0) throw new Error(startFrom);
        reset();
        let index = -1;
        for (const argument of process.argv) {
            if (++index < startFrom) continue;
            if (argument.startsWith(definitionSet.commandLine.prefixes[0]) || definitionSet.commandLine.prefixes[1]) {
                if (argument.   length < 2) { unrecognizedOptions.push(argument); continue; }
                const argumentBody = argument.slice(1);
                const match = definitionSet.commandLine.optionRecognition.regularExpression.exec(argumentBody);
                if (!match) continue;
                const components = definitionSet.commandLine.optionRecognition.components(match);
                const key = components.key;
                if (optionMap.has(key)) { duplicateOptions.push(argument); continue; }
                const metadata = metadataMap.get(key);
                if (metadata)
                    optionMap.set(metadata.key, {
                        key: metadata.key,
                        index: parseInt(index),
                        isMissing: false,
                        name: metadata.name ?? key,
                        description: metadata.description,
                        value: components.value,
                        isPlus: components.plus,
                        isMinus: components.minus });
                else
                    unrecognizedOptions.push(argument);
            } else
                files.push(argument);
        } //loop
        for (const [key, metadata] of metadataMap) { // missing options
            if (optionMap.has(key)) continue;
            optionMap.set(key, {
                key,
                isMissing: true,
                name: metadata.name ?? key,
                description: metadata.description });
        } //loop
    }; //this.parse

    Object.defineProperties(this, {
        files: {
            get() { return files; },
            enumerable: true,
        },
        unrecognizedOptions: {
            get() { return unrecognizedOptions; },
            enumerable: true,
        },
        duplicateOptions: {
            get() { return duplicateOptions; },
            enumerable: true,
        },
    });

} //CommandLine

module.exports = { CommandLine };

/* Usage example:

const options = {
    accounts: { abbreviation: 1, name: "Accounts", description: "Set of accounts and password rules", },
    crypto: { abbreviation: 1, name: "Crypto", description: "A file with substiture Crypto unit", },
    readOnly: { abbreviation: 1, name: "Read-only", description: "Read-only behavior", },
}; //options

const commandLine = new CommandLine(options);
commandLine.parse("5");
console.log(commandLine.option.accounts);
console.log(commandLine.option.crypto);
console.log(commandLine.option.readOnly);
console.log(commandLine.option.unknown);

*/
