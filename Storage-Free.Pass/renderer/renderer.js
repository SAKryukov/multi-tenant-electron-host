"use strict";

window.addEventListener(definitionSet.events.DOMContentLoaded, async () => {

    if (window.bridgeUI) {
        window.bridgeUI.subscribeToApplicationClose(() => {
            return true;
        });
    } else
        return definitionSet.standaloneExecutionProtection.show();

    if (window.bridgePlugin)
        window.bridgePlugin.subscribeToPlugin(async plugins => {
            pluginHandler.load(plugins);
            if (pluginHandler.hasCriticalErrors)
                // temporarily:
                showMessage(pluginHandler.issues, null, true); //close                
            else
                ui(pluginHandler.accountSet, pluginHandler.crypto, window.bridgeMetadata.pushedMetadata());
    }); //if

}); //DOMContentLoaded
