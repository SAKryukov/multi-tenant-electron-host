"use strict";

const createEditorAPI = elementSet => {

    elementSet.editorAPI = (editor => {

        let isModifiedFlag = false;
        const modifiedEventName = definitionSet.events.editorTextModified;
        const modifiedEvent = new Event(modifiedEventName);

        // ad-hoc Tab fix:
        window.addEventListener(definitionSet.events.keydown, event => {
            if (event.code != definitionSet.keys.Tab) return;
            if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.target != editor) return;
            const expectedTab = definitionSet.tabReplacement;
            event.target.setRangeText(expectedTab);
            const position = event.target.selectionStart + expectedTab.length;
            event.target.setSelectionRange(position, position);
            event.preventDefault();
        }); //window.addEventListener Tab fix

        const api = {
            subscribeToModified: handler => editor.addEventListener(modifiedEventName, handler),
            scrollTo: (start, end, select) =>
                adHocUtility.scrollTo(editor, start, end, select),
            scrollToSelection: () =>
                adHocUtility.scrollTo(
                    editor,
                    editor.selectionStart,
                    editor.selectionEnd),
            isLetter: character => character.toLowerCase() != character.toUpperCase(),
            isWordCharacter: function(character) {
                return "0123456789".indexOf(character) >= 0 || this.isLetter(character);
            }, //isWordCharacter
        }; //api

        editor.addEventListener(definitionSet.events.input, () => api.isModified = true);
        Object.defineProperties(api, {
            editor: {
                get() { return editor;  },
            },
            currentLines: {
                get() {
                    const text = editor.value;
                    let left = text.lastIndexOf(definitionSet.newLine, editor.selectionStart - 1);
                    if (left < 0) left = 0; else left += 1;
                    let right = text.indexOf(definitionSet.newLine, editor.selectionEnd);
                    if (right < 0) right = editor.textLength - 1;
                    return [left, right];
                }, // currentLine getter
            }, //currentLines
            currentWord: {
                get() {
                    if (this.editor.selectionStart >= this.editor.textLength - 1)
                        return [this.editor.selectionStart, this.editor.selectionEnd];
                    const nextLetter = this.editor.value.slice(
                        this.editor.selectionStart,
                        this.editor.selectionStart + 1);
                    if (!this.isWordCharacter(nextLetter))
                        return [this.editor.selectionStart, this.editor.selectionEnd];
                    const line = this.currentLines;
                    const regex = /[^\w\s0123456789']/g;
                    const backRegex = /(!<=([\w\s0123456789']))/g;
                    let sliceForward = this.editor.value.slice(this.editor.selectionStart, line[1]);
                    let forward = sliceForward.search(regex);
                    if (forward < 0) forward = line[1];
                    let sliceBackward = this.editor.value.slice(line[0], this.editor.selectionStart);
                    let backward = sliceBackward.search(backRegex);
                    if (backward < 0) backward = line[0];
                    return [line[0] + backward, this.editor.selectionEnd + forward];
                }, //wordOnRight getter
            }, //wordOnRight
            newLine: { get() { return definitionSet.newLine; }},
            empty: { get() { return definitionSet.empty; }},
            blankSpace: { get() { return definitionSet.blankSpace; }},
            selectionLength: {
                get() { return this.editor.selectionEnd - this.editor.selectionStart; },
            }, //selectionLength
            isModified: {
                get() { return isModifiedFlag; },
                set(value) {
                    isModifiedFlag = value;
                    editor.dispatchEvent(modifiedEvent, isModifiedFlag);
                },
            }, //isModified
        });

        return api;
    })(elementSet.editor);

};
