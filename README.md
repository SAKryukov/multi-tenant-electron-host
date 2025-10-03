# Multi-Tenant Electron Host

A multi-tenant Electron host is a facility used to combine multiple tenant applications into a single Electron host application. It solves the problem of the waste of resources created when the application is packaged. The tenant applications contribute some 0.1-0.2% of the resources, sharing the rest. The applications provide mostly or exclusively the renderer part, using the electron resources via the `contextBridge`.

One can develop, debug, and execute applications as standalone applications under Electron. In a packaged form, they work as parts of a single host application, selected by a command-line argument. Several instances of the same or different applications can run in parallel.

Presently, there are two tenant applications: 

* Conceptual Electron Editor is a proof-of-concept text editor that showcases interesting techniques related to Electron, Node.js, and Web technologies. It includes a plugin architecture, macros, refined search and replace conception, and more.

* Personal Database featuring dynamic schemas.


[Editor API Documentation](https://github.com/SAKryukov/conceptual-electron-editor/blob/main/Editor/plugins/plugins.readme.md)
