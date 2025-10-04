"use strict";

const viewMenuSubscription = (menu, statusBar, fullScreen, statusBarElement, statusBarDisplay) => {

    let isStatusBarVisible = true;
    let isFullscreen = false;
    let viewStatusBarItem, viewFullscreenItem;
    
    viewStatusBarItem = menu.subscribe(statusBar, actionRequest => {
        if (!actionRequest) return true;
        isStatusBarVisible = !isStatusBarVisible;
        if (isStatusBarVisible)
            viewStatusBarItem.setCheckedCheckBox();
        else
            viewStatusBarItem.setCheckBox();
        statusBarElement.style.display = statusBarDisplay(isStatusBarVisible);
    }); //view.statusBar
    
    viewStatusBarItem.setCheckedCheckBox();

    viewFullscreenItem = menu.subscribe(fullScreen, actionRequest => {
        if (!actionRequest) return true;
        isFullscreen = !isFullscreen;
        if (isFullscreen)
            viewFullscreenItem.setCheckedCheckBox();
        else
            viewFullscreenItem.setCheckBox();
        window.bridgeUI.fullscreenToggle();
    }); //view.fullscreen
    
    viewFullscreenItem.setCheckBox();

}; //viewMenuSubscription
