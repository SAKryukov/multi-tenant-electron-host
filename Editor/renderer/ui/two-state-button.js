"use strict";

const createTwoStateButton = (tag, cssClassUp, cssClassDown, initialDown) => {

    const twoStateButton = {};
    const element = document.createElement(tag);
    let isDown = initialDown ? true : false;
    let onChange = null

    element.classList.add(isDown ? cssClassDown : cssClassUp);

    const toggle = () => {
        isDown = !isDown;
        const oldToken = isDown ? cssClassUp : cssClassDown;
        const newToken = !isDown ? cssClassUp : cssClassDown;
        element.classList.replace(oldToken, newToken);
        if (onchange)
            onchange(isDown);
    }; //toggle

    element.onpointerup = () => toggle();

    Object.defineProperties(twoStateButton, {
        onchange: {
            get() { return onchange; },
            set(value) { onchange = value; }
        }, //onchange
        isDown: {
            get() { return isDown;}
        }, //isDown
    });

    return twoStateButton;

}; //createTwoStateButton
