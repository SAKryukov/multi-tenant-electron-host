"use strict";

const createTwoStateButton = (element, cssClassUp, cssClassDown, initialDown) => {

    const twoStateButton = {
        isDown: initialDown ? true : false,
        onchange: null,
    };

    element.classList.add(twoStateButton.isDown ? cssClassDown : cssClassUp);

    const toggle = () => {
        twoStateButton.isDown = !twoStateButton.isDown;
        const oldToken = twoStateButton.isDown ? cssClassUp : cssClassDown;
        const newToken = !twoStateButton.isDown ? cssClassUp : cssClassDown;
        element.classList.replace(oldToken, newToken);
    }; //toggle
    const setValue = value => {
        if (value == twoStateButton.isDown) return;
        toggle();
    }; //setValue
    const uiToggle = () => {
        toggle();
        if (twoStateButton.onchange)
            twoStateButton.onchange(twoStateButton.isDown);
    }; //uiToggle

    element.onpointerup = () => uiToggle();
    element.onkeyup = event => {
        if (event.code == "Enter" || event.code == "Space") {
            uiToggle();
            event.preventDefault();
        } //if
    }; //element.onkeyup

    Object.defineProperties(twoStateButton, {
        value: {
            get() { return twoStateButton.isDown; },
            set(value) {
                setValue(value);
            },
        }, //value
        onchangeState: {
            get() { return twoStateButton.onchange; },
            set(value) { twoStateButton.onchange = value; }
        }, //onchangeState
        element: {
            get() { return element; }
        },
    });

    return twoStateButton;

}; //createTwoStateButton
