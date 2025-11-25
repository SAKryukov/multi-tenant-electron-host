"use strict";

const definitionSet = (() => {
    
    const definitionSetExtension = {
        meta: [
            { name: "author", content: "Sergey A Kryukov" },
            { name: "owner", content: "Sergey A Kryukov" },
            { name: "keywords", content: "security, password, passwords, generator, cryptography, cryptographic, hash, SHA-256" },
        ],
        clipboardWarningTimeout: 5000,
        elements: {
            button: 0,
            span: 0,
            a: 0,
        }, //elements
        cssClasses: {
            anchor: 0,
        }, //cssClasses
        pluginErrors: {
            missingOption: optionKey =>
                `<p>Add option -${optionKey}:&lt;file name&gt;</p>`,
            fileNotFound: (optionKey, filename) =>
                `<p>Specified file not found: -${optionKey}:${filename}</p>`,
            codeException: (filename, errorMessage, line, column) =>
                `<p>Invalid code in the file ${filename}:<br>` +
                `<span style="color:red">${errorMessage}</span><br/>` +
                `Line: ${line}, column: ${column}</p>`,
            allIssues: issues =>
                `<h2>Plugin ${issues.length > 1 ? "errors" : "error"}:</h2><br/>${issues.join("<br/")}</br>`,
        },
        documentationError: (uri, error) =>
            `Error loading ${uri}<br/>` +
            `<p style="color:red">${error}</p><br/>`,
        paths: {
            image: "../images/pass.png",
        },
        buttonActivation: event =>
            event.code == "Enter" || event.code == "Space",
    }; //definitionSetExtension

    namespaces.initializeNames([
        definitionSetExtension.elements,
        definitionSetExtension.cssClasses]);

    namespaces.extend(extensibleDefinitionSet, definitionSetExtension);

    return extensibleDefinitionSet;

})();
