"use strict";

(function upgradeString(){
    if (!String.empty) {
        Object.defineProperty(String, "empty", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: ""
        });
    } //if !String.empty
})();

const utility = {

    populateUndefined: function(structure, defaultStructure) {
        for (let index in defaultStructure) {
            if (defaultStructure[index] instanceof Object) {
                if (structure[index] == undefined)
                    structure[index] = new defaultStructure[index].constructor();
                this.populateUndefined(structure[index], defaultStructure[index]);
            } else
                if (structure[index] == undefined)
                    structure[index] = defaultStructure[index];
        } //loop
    }, //populateUndefined

    hiddenString: length => { return new Array(length + 1).join(String.fromCodePoint(0x2022)) }, //bullet

    createReadonly: function (structure) {
        for (let index in structure)
            if (structure[index] && structure[index] instanceof Object)
                structure[index] = this.createReadonly(structure[index]);
        return new Proxy(structure, { set: () => { }, });
    }, //createReadonly

    clipboard: {
        copy: text => {
            const type = "text/plain";
            const clipboardItemData = { [type]: text, };
            const clipboardItem = new ClipboardItem(clipboardItemData);
            navigator.clipboard.write([clipboardItem]);            
        } //copy
    }, //clipboard

    styleSize: value => `${value}px`,

    showPartialVersion: (version, count) => {
        const separator = ".";
        const components = version.split(separator);
        return components.splice(0, count).join(separator);
    } //showPartialVersion

};

