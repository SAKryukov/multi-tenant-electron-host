"use strict";

module.exports.pluginProvider = (() => {

    const { CommandLine } = require("../../shared/main/command-line.js");
    const fs = require("node:fs");
    const path = require("node:path");

    const options = {
        crypto: { abbreviation: 1, name: "Crypto", description: "A file with substiture Crypto unit", },
        accounts: { abbreviation: 1, name: "Accounts", description: "Set of accounts and password rules", },
        documentation: { abbreviation: 1, name: "Account Documentation", description: "Documentation on account detils, informal", },
    }; //options

    const commandLine = new CommandLine(options);
    commandLine.parse(4);
    let window;

    const getOption = (option, directory) => {
        if (option.isMissing) return { isMissing: true };
        const filename = path.join(directory, option.value);
        const found = fs.existsSync(filename);
        return { filename, found, isMissing: false }
    }; //getOption

    const pluginProvider = {
        setup: environment => {
            window = environment.window;
        }, //setup
        sendScripts: channel => {
            const cwd = process.cwd();
            const crypto = getOption(commandLine.option.crypto, cwd);
            const accounts = getOption(commandLine.option.accounts, cwd);
            const accountDocumentation = getOption(commandLine.option.documentation, cwd);
            window.webContents.send(channel, {
                crypto,
                accounts,
                accountDocumentation,
            });
        }, //sendScripts
    }; //pluginProvider

    return pluginProvider;

})();
