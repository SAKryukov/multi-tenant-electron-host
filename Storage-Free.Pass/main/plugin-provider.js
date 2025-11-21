"use strict";

module.exports.pluginProvider = (() => {

    const { definitionSet } = require("./definition-set.js");
    const { CommandLine } = require("../../shared/main/command-line.js");
    const fs = require("node:fs");
    const path = require("node:path");

    const commandLine = new CommandLine(definitionSet.commandLine.options);
    commandLine.parse(definitionSet.commandLine.start);
    let window;

    const getOption = (option, directory) => {
        if (option.isMissing) return { isMissing: true, key: option.key };
        const filename = path.join(directory, option.value);
        const found = fs.existsSync(filename);
        return { key: option.key, filename, found, isMissing: false }
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
