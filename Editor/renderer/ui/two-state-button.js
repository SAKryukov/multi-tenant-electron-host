"use strict";

const createTwoStateButton = (element, cssClassUp, cssClassDown, initialDown) => {

    let isDown = initialDown ? true : false;

    element.classList.add(isDown ? cssClassDown : cssClassUp);

    const toggle = () => {
        isDown = !isDown;
        const oldToken = isDown ? cssClassUp : cssClassDown;
        const newToken = !isDown ? cssClassUp : cssClassDown;
        element.classList.replace(oldToken, newToken);
        if (onchange)
            onchange(isDown);
    }; //toggle
    const setValue = value => {
        if (value == isDown) return;
        toggle();
    }; //setValue

    element.onpointerup = () => toggle();
    element.onkeypress = event => {
        if (event.code == "Enter" || event.code == "Space") {
            toggle();
            event.preventDefault();
        } //if
        if (event.repeat)
            event.preventDefault();
    }; //element.onkeyup
    
    const twoStateButton = {};
    Object.defineProperties(twoStateButton, {
        value: {
            get() { return isDown; },
            set(value) {
                setValue(value);
            },
        }, //value
        onchange: {
            get() { return onchange; },
            set(value) { onchange = value; }
        }, //onchange
        isDown: {
            get() { return isDown; }
        }, //isDown
        element: {
            get() { return element; }
        }, 
    });

    return twoStateButton;

}; //createTwoStateButton
