"use strict";

const showMessage = (html, focusElement) => {
    modalDialog.show(html, {
        buttons: [
            {
                text: definitionSet.defaultMessageDialog.defaultButton,
                isEscape: true, isDefault: true,
                action: () => { if (focusElement)focusElement.focus(); },
            }]
    });
}; //showMessage
