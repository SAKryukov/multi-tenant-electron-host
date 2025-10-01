"use strict";

const extensibleDefinitionSet = (() => {
    
    const definitionSet = {
        characters: {
            empty: "", blankSpace: " ", newLine: "\n",    
        }, //characters
        events: {
            DOMContentLoaded: 0,
            keydown: 0,
            click: 0,
            selectionchange: 0,
            input: 0,
            reading: 0, // Sensor: GravitySensor, Accelerometer...
            //custom:
            editorTextModified: 0,
        }, //events
        defaultMessageDialog: {
            defaultButton: "Close",
        },
        aboutDialog: (metadata, imagePath) => {
            const hostVersionLine =
                metadata?.package?.applicationHostDescription
                    ? `<br/>${metadata.package.applicationHostDescription} version: ${metadata.applicationVersion}`
                    : "";
            return `<h4> <img src="${imagePath}"/>${metadata?.package?.description}</h4>
            <br/>Application version: ${metadata.package.version}
            ${hostVersionLine}
            <br/>
            <br/>Platform: ${metadata.platform}
            <br/>CPU architecture: ${metadata.architecture}
            <br/>
            <br>Electron: v.&thinsp;${metadata.versions.electron}
            <br/>Chromium: v.&thinsp;${metadata.versions.chrome}
            <br/>Node.js: v.&thinsp;${metadata.versions.node}
            <br/>
            <br/>${metadata?.package?.metadata?.copyright}
            <br/><br/>`
        }, //aboutDialog
        standaloneExecutionProtection: {
            copyright: "Copyright &copy; Sergey A Kryukov",
            url: "https://github.com/SAKryukov/conceptual-electron-editor",
            electron: "https://www.electronjs.org",
            show: function () {
                const electron = `<a href="${this.electron}">Electron</a>`;
                document.body.innerHTML = `<aside>This HTML only works under ${electron}</aside>
                <p><a href="${this.url}">Conceptual Electron Editor</a>, ${this.copyright}</p>`;
                window.stop();
            }, //show
        }, //standaloneExecutionProtection
    }; //definitionSet

    namespaces.initializeNames([ definitionSet.events, ]);

    return namespaces.create(definitionSet);

})();
