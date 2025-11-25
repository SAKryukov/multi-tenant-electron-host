"use strict";

function ElectronAnchorButton() {

    const element = document.createElement(definitionSet.elements.span);
    element.classList.add(definitionSet.cssClasses.anchor);
    element.tabIndex = 0;
    let uri = null;
    let filename = null;
    let help = false;
    let customHandler = null;
    let errorHandler = error => alert(error);
    let isEnabled = true;

    this.append = parent =>
        parent.appendChild(element);

    const inputHandler = () => {
        if (!isEnabled)
            returnl
        if (customHandler) // priority
            customHandler();
        else if (help) 
            window.bridgeUI.showInBrowserHelp();
        else if (filename != null)
            window.bridgeUI.openLocalFile(filename, false, (filename, error) => errorHandler?.(filename, error));
        else if (uri != null)
            window.bridgeUI.showExternalUri(uri, (uri, error) => errorHandler?.(uri, error));
    }; //inputHandler

    element.onclick = () => inputHandler();
    element.onkeydown = event => {
        if (!definitionSet.buttonActivation(event)) return;
        inputHandler();
        event.preventDefault();
    }; //element.onkeydown

    Object.defineProperties(this, {
        text: {
            set(value) { element.textContent = value; }
        },
        text: {
            set(value) { element.textContent = value; }
        },
        title: {
            set(value) { element.title = value; }
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
        customHandler: {
            set(value) { customHandler = value; }
        },
        errorHandler: {
            set(value) { errorHandler = value; }
        },
        enabled: {
            set(value) {
                isEnabled = value;
                if (value)
                    element.classList.remove(definitionSet.cssClasses.disabled);
                else
                    element.classList.add(definitionSet.cssClasses.disabled);
                element.tabIndex = value ? 0 : -1;
            } //enabled set
        }, //enabled
    });

}; //ElectronAnchorButton
