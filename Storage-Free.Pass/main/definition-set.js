"use strict";

const definitionSet = {
    paths: {
        preload: "../shared/IPC/preload.js",
        index: "renderer/index.html",
        package: "package.json",
        metadata: "metadata.json",
        applicationIcon: "images/pass.png",
    },
    invalidApplicationPack: {
        title: "Invalid application pack",
        message:   
            `This application pack cannot work as a stand-alone application. Here are the valid alternatives:` +
            `\n\n` +
            `    1. Pack the application multi-tenant-host\n` +
            `    2. Execute the application under Electron`
    }, //invalidApplicationPack
    utility: {
        fileNaming: {
            title: (baseFilename, title) =>
                `${baseFilename} ${String.fromCharCode(0x2014)} ${title}`,
        },
    }, //utility
    commandLine: {
        options: {
            crypto: { abbreviation: 1, name: "Crypto", description: "A file with substiture Crypto unit", },
            accounts: { abbreviation: 1, name: "Accounts", description: "Set of accounts and password rules", },
            documentation: { abbreviation: 1, name: "Account Documentation", description: "Documentation on account detils, informal", },
        }, //options
        start: 4,
    }, //commandLine
};

for (const subset of [definitionSet.events])
    for (const index in subset)
        if (!subset[index])
            subset[index] = index;
Object.freeze(definitionSet);

module.exports = { definitionSet };
