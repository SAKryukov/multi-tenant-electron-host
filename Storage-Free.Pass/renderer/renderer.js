"use strict";

window.addEventListener(definitionSet.events.DOMContentLoaded, async () => {

    if (window.bridgeUI) {
        window.bridgeUI.subscribeToApplicationClose(() => {
            return true;
        });
    }; //window.bridgePlugin.subscribeToPlugin

    if (window.bridgePlugin)
        window.bridgePlugin.subscribeToPlugin(async plugins => {
            //const filename = plugins.crypto; //SA???
    });

}); //DOMContentLoaded
