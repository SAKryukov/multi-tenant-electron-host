"use strict";

const showMessage = (html, focusElement, closeApplication) => {
    modalDialog.show(html, {
        buttons: [
            {
                text: definitionSet.defaultMessageDialog.defaultButton,
                isEscape: true, isDefault: true,
                action: () => {
                    if (focusElement) focusElement.focus();
                    if (closeApplication) window.bridgeFileIO.closeApplication();
                },
            }]
    });
}; //showMessage
