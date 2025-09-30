/*
Personal Database

Copyright (c) 2017, 2023, 2025 by Sergey A Kryukov
http://www.SAKryukov.org
http://www.codeproject.com/Members/SAKryukov
*/

"use strict";

const Hint = function (elementOrString) {
    // if elementOrString is string, should be shown with this.show
    // if this is HTMLElement, its title value is used

    const definitionSet = {
        hint: {
            noTitle: "",
            element: "cite",
            offset: { x: 2, y: 2 },
            timeout: 4000,
        },
        CSS: {
            display: {
                none: "none",
                button: "inline",
            }, //display
            position: {
                hint: "absolute",
            }, //position
            coordinate: value => `${value}px`,
        }, //CSS
    }; //definitionSet

    let text, time;
    
    if (elementOrString instanceof HTMLElement) {
        text = elementOrString.title;
        elementOrString.title = definitionSet.hint.noTitle;
        time =  definitionSet.hint.timeout;
    } else if (elementOrString.constructor == String)
        text = elementOrString;
    else
        return;

    const element = document.createElement(definitionSet.hint.element);
    element.textContent = text;
    element.style.display = definitionSet.CSS.display.none;
    element.style.position = definitionSet.CSS.position.hint;
    element.style.zIndex = Number.MAX_SAFE_INTEGER;
    document.body.appendChild(element);

    const show = function (currentTarget, remove) {
        if (!currentTarget) currentTarget = elementOrString;
        element.style.display = remove
            ? definitionSet.CSS.display.none
            : null;
        if (!remove) {
            const targetRectangle = currentTarget.getBoundingClientRect();
            let xOrientationLeft = true;
            let yOrientationTop = true;
            let y = targetRectangle.top + targetRectangle.height + definitionSet.hint.offset.y;
            let x = targetRectangle.left;
            if (x + element.offsetWidth >= window.innerWidth) {
                xOrientationLeft = false;
                x = definitionSet.hint.offset.x;
            } //if
            if (y + element.offsetHeight >= window.innerHeight) {
                yOrientationTop = false;
                y = window.innerHeight - targetRectangle.top + definitionSet.hint.offset.y;
            } //if
            if (yOrientationTop)
                element.style.top = definitionSet.CSS.coordinate(y);
            else
                element.style.bottom = definitionSet.CSS.coordinate(y);
            if (xOrientationLeft)
                element.style.left = definitionSet.CSS.coordinate(x);
            else
                element.style.right = definitionSet.CSS.coordinate(x);
        } //if
    } //show
    this.show = cell => show(cell, cell == null);

    if (elementOrString && elementOrString instanceof HTMLElement) {
        elementOrString.onpointerenter = () => {
            show(null);
            if (time)
                setTimeout(() => show(null, true), time);
        }; //target.onpointerenter
        elementOrString.onmouseleave = () => {
            show(null, true);
        }; //target.onpointerleave    
    } //if

}; //Hint

const replaceTitlesWithHints = () => {
    const titledElements = document.querySelectorAll("[title]");
    for (const element of titledElements)
        new Hint(element);
}; //replaceTitlesWithHints
