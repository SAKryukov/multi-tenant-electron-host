# Conceptual Electron Editor

Proof-of-concept editor based on [Electron](https://www.electronjs.org) showcases interesting techniques related to Electron,
Node.js, and Web technologies. It includes a plugin architecture, macros, refined search and replace conception, cross-platform packaging, multi-process debugging, and more.

The application presents a *multi-tenant host* used to house several applications in a single package, sharing the resources. Presently, it includes a text editor and a personal dynamic-scheme database.

One can develop, debug, and execute applications as standalone applications under Electron. In a packaged form, they work as parts of a single host application, selected by a command-line argument. Several instances of the same or different applications can run in parallel.

[Editor API Documentation](https://github.com/SAKryukov/conceptual-electron-editor/blob/main/Editor/plugins/plugins.readme.md)
