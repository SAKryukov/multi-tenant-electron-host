"use strict";

const pluginHandler = (() => {

    let crypto = passwordGenerator;
    let accountSet = null;
    let accountDocumentation = null;
    let lastError = null;

    const loadPlugin = filename => {
        let error = null;
        let plugin = null;
        window.bridgePlugin.loadPlugin(filename, (result, error) => {
            if (error)
                error = lastError;
            else
                plugin = result;
        });
        return { error, plugin };
    }; //loadPlugin

    const issueClassifier = {
        missing: { optionKey: 0, },
        fileNotFound: { optionKey: 0, filename: 0, },
        codeException: { optionKey: 0, filename: 0, errorMessage: null, line: null, column: null, },
    }; //issueClassifier

    const issues = [];

    const processPlugin = (option, isDocumentation, isOptional) => {
        if (option.isMissing && isOptional)
            return null;
        if (option.isMissing)
            return issues.push({ classified: issueClassifier.missing, optionKey: option.key });
        if (!option.found)
            return issues.push({ classified: issueClassifier.fileNotFound, optionKey: option.key,
                filename: option.filename });
        if (isDocumentation)
            return option.filename;
        const accountSetCandidate = loadPlugin(option.filename);
        if (accountSetCandidate.error)
            return issues.push({ classified: issueClassifier.codeException, optionKey: option.key,
                filename: option.filename,
                errorMessage: accountSetCandidate.error.message,
                line: accountSetCandidate.error.line,
                column: accountSetCandidate.error.column, });
        else
            return accountSetCandidate.plugin;
    } //processPlugin

    const processAccounts = option => 
        accountSet = processPlugin(option);
    const processCrypto = option => 
        crypto = processPlugin(option);
    const processAccountDocumentation = option =>
        accountDocumentation = processPlugin(option, true);

    const pluginHandler = {
        load: plugins => {
            window.onerror = (message, source, line, column, error) =>
                lastError = { message, source, line, column, error };
            processAccounts(plugins.accounts);
            processAccountDocumentation(plugins.accountDocumentation, true); // documentation
            processCrypto(plugins.crypto, false, true); // not documentation, optional
            window.onerror = null;
        }, //load
    }; //pluginHandler

    Object.defineProperties(pluginHandler, {
        crypto: {
            get() { return crypto; }
        },
        accountSet: {
            get() { return accountSet; }
        },
        accountDocumentation: {
            get() { return accountDocumentation; }
        },
        hasCriticalErrors: {
            get() { return issues.length > 0; }
        },
    }); //Object.defineProperties

    return pluginHandler;

})();
