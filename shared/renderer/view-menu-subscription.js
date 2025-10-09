"use strict";

const viewMenuSubscription = (
    menu,
    menuItemStatusBar, menuItemFullScreen,
    menuItemZoomIn, menuItemZoomOut, menuItemZoomReset,
    statusBarElement, statusBarDisplay) => {

    let isStatusBarVisible = true;
    let isFullscreen = false;
    let viewStatusBarItem, viewFullscreenItem;
    
    viewStatusBarItem = menu.subscribe(menuItemStatusBar, actionRequest => {
        if (!actionRequest) return true;
        isStatusBarVisible = !isStatusBarVisible;
        if (isStatusBarVisible)
            viewStatusBarItem.setCheckedCheckBox();
        else
            viewStatusBarItem.setCheckBox();
        statusBarElement.style.display = statusBarDisplay(isStatusBarVisible);
    }); //view.statusBar
    
    viewStatusBarItem.setCheckedCheckBox();

    viewFullscreenItem = menu.subscribe(menuItemFullScreen, actionRequest => {
        if (!actionRequest) return true;
        isFullscreen = !isFullscreen;
        if (isFullscreen)
            viewFullscreenItem.setCheckedCheckBox();
        else
            viewFullscreenItem.setCheckBox();
        window.bridgeUI.fullscreenToggle();
    }); //view.fullscreen

    menu.subscribe(menuItemZoomIn, actionRequest => {
        if (!actionRequest) return window.bridgeUI.canZoomIn();
        window.bridgeUI.zoomIn();
    }).subscribeToShortcut(definitionSet.zoom.shortcuts.zoomIn); //view.menuItemZoomIn

    menu.subscribe(menuItemZoomOut, actionRequest => {
        if (!actionRequest) return window.bridgeUI.canZoomOut();
        window.bridgeUI.zoomOut();
    }).subscribeToShortcut(definitionSet.zoom.shortcuts.zoomOut); //view.menuItemZoomIn

    menu.subscribe(menuItemZoomReset, actionRequest => {
        if (!actionRequest) return true;
        window.bridgeUI.zoomReset();
    }).subscribeToShortcut(definitionSet.zoom.shortcuts.zoomReset); //view.menuItemZoomIn
    
    viewFullscreenItem.setCheckBox();

}; //viewMenuSubscription
