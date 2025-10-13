# Multi-Tenant Electron Host

Multi-tenant [Electron](https://www.electronjs.org) host is the facility used to combine several *tenant applications* in a single Electron host application. It solves the problem of the waste of resources created when the application is packaged. The tenant applications contribute some 0.1-0.2% of the resources, sharing the rest. The applications provide mostly or exclusively only the *renderer* part, using the electron resources via the *contextBridge*. Even some renderer resources are also shared, such as component libraries and a common definition set.

A tenant application has dual usage, as a separate Electron application or as a part of the Multi-tenant Electron host. One can develop, debug, and execute applications as standalone applications under Electron. In a packaged form, they work as parts of a single host application, selected by a command-line argument. Several instances of the same or different applications can run in parallel.

The solution features cross-platform packaging and multi-process debugging and refined UI conceptions: culture-independent menus with the unified subscription based on *command sets*, hot keys, replacement for HTML *access keys*, hints used as the replacement for HTML titles.

Presently, there are two tenant applications:

* Conceptual Electron Editor is a proof-of-concept text editor that showcases interesting techniques related to Electron, Node.js, and Web technologies. It includes a plugin architecture, macros, refined search and replace conceptions.

* Personal Database is a single-file database featuring dynamic schemas.

[Command Line](https://github.com/SAKryukov/conceptual-electron-editor/blob/main/docs/command-line.md)

[Editor API Documentation](https://github.com/SAKryukov/conceptual-electron-editor/blob/main/Editor/plugins/plugins.readme.md)
