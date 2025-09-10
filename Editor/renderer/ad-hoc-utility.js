"use strict";

const adHocUtility = (() => {

    let persistGotoLine = null, persistGotoLineColumn = null;

    const implementation = {
        scrollTo: (editor, start, end) => {
            const fullText = editor.value;
            editor.value = fullText.substring(0, end);
            const scrollHeight = editor.scrollHeight
            editor.value = fullText;
            let scrollTop = scrollHeight;
            const editorHeight = editor.clientHeight;
            scrollTop = scrollTop > editorHeight
                ? scrollTop -= editorHeight / 2
                : scrollTop = 0;
            editor.scrollTop = scrollTop;
            editor.setSelectionRange(start, end);
        }, //scrollTo
        decimalDidits: "0123456789",
        filterOut: (element, characters) =>
            element.onkeydown = event => {
                if (event.key && event.key.length == 1 && characters.indexOf(event.key) < 0)
                    event.preventDefault();
            }, //filter out
        goto: function(editor) {
            const section = document.createElement(definitionSet.elements.section);
            const createLine = (text, title, value) => {
                const line = document.createElement(definitionSet.elements.p);
                const legend = document.createElement(definitionSet.elements.span);
                legend.textContent = text;
                const input = document.createElement(definitionSet.elements.input);
                input.value = value;
                input.title = title;
                input.placeholder = title;
                input.style.paddingLeft = input.style.paddingRight = "1em";
                this.filterOut(input, this.decimalDidits);
                line.style.display = "flex";
                line.style.flexDirection = "row";
                line.style.alignItems = "center";
                line.style.justifyContent = "space-between";
                line.style.marginTop = "0.2em";
                line.appendChild(legend);
                line.appendChild(input);
                return { line, input };
            }; //createLine
            const lineLine = createLine("Line: ", "Line to go",
                persistGotoLine ? persistGotoLine : null);
            const lineColumn = createLine("Column: ", "Column to go",
                persistGotoLineColumn ? persistGotoLineColumn : null);
            section.appendChild(lineLine.line);
            section.appendChild(lineColumn.line);
            section.appendChild(document.createElement(definitionSet.elements.br));
            modalDialog.show(section, {
                buttons: [
                    {   text: "Go to Line/Column",
                        default: true, isDefault: true, isEnter: true, 
                        action: () => {
                            let line = lineLine.input.value.trim();
                            let column = lineColumn.input.value.trim();
                            if (!line) line = 1;
                            if (!column) column = 1;
                            line = parseInt(line);
                            column = parseInt(column);
                            if (line < 0) line = 1;
                            if (column < 0) column = 1;
                            const lines = editor.value.substring(0).split("\n");
                            if (line > lines.length)
                                line = lines.length;
                            if (lines < 1) return;
                            let position = 0;
                            for (let index = 0; index < line - 1; ++index)
                                position += lines[index].length + 1;
                            const maxLength = lines[line - 1].length;
                            if (column > maxLength)
                                column = maxLength + 1;
                            position += column - 1;
                            editor.focus();
                            editor.selectionStart = editor.selectionEnd = position;
                            persistGotoLine = lineLine.input.value.trim();
                            persistGotoLineColumn = lineColumn.input.value.trim();
                            lineColumn.line.value = persistGotoLineColumn;
                            this.scrollTo(editor, position, position);
                        }, //goto action
                    }, // button Go to
                    { text: "Close", isEscape: true, },
                ],
                options: { initialFocus: lineLine.input },
            });
        }, //goto
    }; //implementation
    Object.freeze(implementation);

    return implementation;
    
})(); //adHocUtility
