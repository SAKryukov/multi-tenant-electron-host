"use strict";

const createMacroProcessor = (editor, stateIndicator, editorAPI) => {

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

    const perfomSmartIndentation = event => {
        let data = definitionSet.empty;
        const entering = event.inputType == definitionSet.macro.specialInputTypeNewLine.recorded;
        const backspace = event.inputType == definitionSet.macro.backspace;
        if (!entering && !backspace) return null;
        let location = editor.selectionStart;
        if (location != editor.selectionEnd) return null;
        const currentLinePosition = editorAPI.currentLines;
        if (entering) {
            const previousLine = editorAPI.previousLine;
            if (event.target.value.slice(currentLinePosition[0], currentLinePosition[1]).trim().length > 0)
                return null;
            const slice = event.target.value.slice(previousLine[0], previousLine[1]);
            const indentSize = slice.length - slice.trimLeft().length;
            if (!indentSize)
                return null;
            const indent = definitionSet.blankSpace.repeat(indentSize);
            editor.setRangeText(indent);
            data = indent; //SA???
            location += indentSize;
            editor.setSelectionRange(location, location);
        } else if (backspace) {
            const currentIndentBuffer = event.target.value.slice(currentLinePosition[0], location);
            const currentIndent = currentIndentBuffer.length;
            if (currentIndentBuffer.trim().length > 0) return null;
            const linesBuffer = event.target.value.slice(0, location);
            const lines = linesBuffer.split(definitionSet.newLine);
            let requiredIndent = null;
            for (let index = lines.length - 1; index >= 0; --index) {
                const line = lines[index];
                const indent = line.length - line.trimLeft().length;
                if (indent < currentIndent) {
                    requiredIndent = indent;
                    break;
                } //if
            } //loop
            if (requiredIndent == null)
                requiredIndent = 0;
            const deleteCount = currentIndent - requiredIndent;
            editor.setSelectionRange(location - deleteCount, location);
            editor.setRangeText(definitionSet.empty);
        } //if
        return data;
    }; //perfomSmartIndentation

    // record macro
    editor.addEventListener(definitionSet.events.input, event => {
        if (!recordingMacro)
            return perfomSmartIndentation(event);
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
    }); //editor input record macro

    const playMacro = () => {
        if (recordingMacro) return;
        const delta = editor.selectionStart - firstSelection[0];
        for (const element of macro) {
            let currentState = getState(editor);
            const range = currentState.position + element.delta.position;
            editor.setRangeText(element.data, range - element.data.length, range - element.delta.length);
            adHocUtility.scrollTo(editor, range, range, true);
            editorAPI.isModified = true;
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
        definitionSet.ui.showInline(stateIndicator, on || macro.length > 0);
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
