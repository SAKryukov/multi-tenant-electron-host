"use strict";

const extensibleDefinitionSet = (() => {
    
    const definitionSet = {
        characters: {
            empty: "", blankSpace: " ", newLine: "\n",    
        }, //characters
        events: {
            DOMContentLoaded: 0,
            keydown: 0,
            selectionchange: 0,
            input: 0,
            reading: 0, // Sensor: GravitySensor, Accelerometer...
            //custom:
            editorTextModified: 0,
        }, //events
    }; //definitionSet

    namespaces.initializeNames([ definitionSet.events, ]);

    return namespaces.create(definitionSet);

})();
