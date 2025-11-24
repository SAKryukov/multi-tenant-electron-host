"use strict";

function ElectronAnchorButton() {

    const element = document.createElement(definitionSet.elements.button);
    element.className = definitionSet.cssClasses.anchor;
    let uri = null;
    let filename = null;
    let help = false;
    let errorHandler = error => alert(error);

    this.append = parent =>
        parent.appendChild(element);

    element.onclick = () => {
        if (help) // priority
            window.bridgeUI.showInBrowserHelp();
        else if (filename != null)
            window.bridgeUI.openLocalFile(filename, false, (filename, error) => errorHandler?.(filename, error));
        else 
            window.bridgeUI.showExternalUri(uri, (uri, error) => errorHandler?.(uri, error));
    } //element.onclick

    Object.defineProperties(this, {
        text: {
            set(value) { element.textContent = value; }
        },
        text: {
            set(value) { element.textContent = value; }
        },
        uri: {
            set(value) { uri = value; }
        },
        filename: {
            set(value) { filename = value; }
        },
        help: {
            set(value) { help = value; }
        },
        errorHandler: {
            set(value) { errorHandler = value; }
        },
        enabled: {
            set(value) { element.disabled = !value; }
        },
    });

}; //ElectronAnchorButton
