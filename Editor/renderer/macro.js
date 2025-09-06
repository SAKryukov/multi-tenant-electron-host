"use strict";

const createMacroProcessor = (editor, stateIndicator) => {

    let recordingMacro = false;
    let macro = [];
    let previousState = null;
    let firstSelection = null, lastSelection = null;

    const getSelection = () => [ editor.selectionStart, editor.selectionEnd ];
    const getState = target => {
        return {
            length: target.textLength,
            position: target.selectionStart,
        }
    }; //getState
    const getDelta = (older, newer) => {
        return { // delta
            length: newer.length - older.length,
            position: newer.position - older.position,
        };
    } //getDelta

    editor.addEventListener(definitionSet.events.input, event => {
        if (!recordingMacro) return;        
        const currentState = getState(event.target);
        const delta = getDelta(previousState, currentState);
        previousState = currentState;
        let data = event.data ? event.data : definitionSet.empty;
        if (!data && event.inputType == definitionSet.macro.specialInputTypeNewLine.recorded) // ugly special case
            data = definitionSet.macro.specialInputTypeNewLine.replaced;
        macro.push({
            data: data,
            state: currentState,
            delta: delta,
        });
    }); //editor input

    const playMacro = () => {
        if (recordingMacro) return;
        const delta = editor.selectionStart - firstSelection[0];
        for (const element of macro) {
            let currentState = getState(editor);
            const range = currentState.position + element.delta.position;
            editor.setRangeText(element.data, range - element.data.length, range - element.delta.length);
            editor.setSelectionRange(range, range);
        } //loop
        editor.setSelectionRange(lastSelection[0] + delta, lastSelection[1] + delta);
    }; //playMacro

    const recordingState = () => recordingMacro;
    const setRecordingState = on => {
        if (on)
            macro = [];
        recordingMacro = on;
        stateIndicator.innerHTML = on
            ? definitionSet.status.macroRecording
            : (macro.length > 0
                ? definitionSet.status.macroAvailable
                : null);
        stateIndicator.style.animation = on
           ? definitionSet.status.macroIndicatorAnimation
            : null;
        if (on) {
            previousState = getState(editor);
            firstSelection = getSelection();
        } else
            lastSelection = getSelection();
    } //setRecordingState
    const canRecord = () => !recordingMacro;
    const canStopRecording = () => recordingMacro;
    const canPlay = () => !recordingMacro && macro.length > 0;

    // Hot keys Ctrl+Shift+R (record start/stop), Ctrl+Shift+P (play macro):
    window.addEventListener(definitionSet.events.keydown, event => {
        if (event.shiftKey && event.ctrlKey) {
            if (event.code == definitionSet.keys.KeyP && canPlay()) {
                playMacro();
                event.preventDefault();
            } else if (event.code == definitionSet.keys.KeyR) {
                let decision = null;
                if (canRecord())
                    decision = true;
                else if (canStopRecording())
                    decision = false;
                if (decision != null)
                    setRecordingState(decision);
                event.preventDefault();
            } //if
        } //if
    }); //window.addEventListener

    return { canRecord, canStopRecording, canPlay, recordingState, setRecordingState, playMacro, };

};
