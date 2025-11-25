"use strict";

const pluginHandler = (() => {

    let crypto = passwordGenerator;
    let accountSet = null;
    let lastError = null;

    const loadPlugin = filename => {
        let error = null;
        let plugin = null;
        window.bridgePlugin.loadPlugin(filename, (aPlugin, anError) => {
            if (anError)
                error = lastError;
            else
                plugin = aPlugin;
        });
        return { error, plugin };
    }; //loadPlugin

    const issueClassifier = {
        missing: 1, //{ optionKey, },
        fileNotFound: 2, // { optionKey, filename, },
        codeException: 3, // { optionKey, filename, errorMessage, line, column, },
    }; //issueClassifier

    const issues = [];
    const formatIssues = () => {
        const items = [];
        for (const issue of issues)
            switch (issue.classified) {
                case issueClassifier.missing:
                items.push(definitionSet.pluginErrors.missingOption(issue.optionKey)); break;
                case issueClassifier.fileNotFound:
                items.push(definitionSet.pluginErrors.fileNotFound(issue.optionKey, issue.filename)); break;
                case issueClassifier.codeException:
                items.push(definitionSet.pluginErrors.codeException(
                    issue.filename,
                    issue.errorMessage,
                    issue.line, issue.column)); break;
            } //switch
        return definitionSet.pluginErrors.allIssues(items);
    } //formatIssues

    const processPlugin = (option, isOptional) => {
        if (option.isMissing && !isOptional)
            return null;
        if (option.isMissing)
            return issues.push({ classified: issueClassifier.missing, optionKey: option.key });
        if (!option.found)
            return issues.push({ classified: issueClassifier.fileNotFound, optionKey: option.key,
                filename: option.filename });
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
        crypto = processPlugin(option) ?? crypto;

    const pluginHandler = {
        load: plugins => {
            window.onerror = (message, source, line, column, error) =>
                lastError = { message, source, line, column, error };
            processAccounts(plugins.accounts);
            processCrypto(plugins.crypto, true); // optional
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
        hasCriticalErrors: {
            get() { return issues.length > 0; }
        },
        issues: {
            get() { return formatIssues(issues); }
        },
    }); //Object.defineProperties

    return pluginHandler;

})();
