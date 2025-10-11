"use strict";
??
({
    name: "Select Previous Word",
    description: "Select previous word",
    handler: api => {
        const point = api.previousWord;
        api.scrollTo(point[0], point[1]);
    },
    menuItemIndent: demoGroupIndent,
});
