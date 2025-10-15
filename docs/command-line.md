# Command Line

A tenant application has dual usage, as a separate Electron application or as a part of the Multi-tenant Electron host.

In turn, the Multi-tenant Electron host can be executed under Electron or as a packaged application.

### Under Electron

Let's assume that `electron` is a command providing access to the Electron application.

~~~
electron <tenant_application_directory> <tenant-application-specific-arguments...>
~~~

For example, if the current directory is [`Editor`](https://github.com/SAKryukov/multi-tenant-electron-host/tree/main/Editor) or [`Personal.Database`](https://github.com/SAKryukov/multi-tenant-electron-host/tree/main/Personal.Database), any of these applications can be started as

~~~
electron . <data_file>
~~~

To start a tenant application as a part of the multi-tenant Electron host, the application name should be specified using the following syntax:

~~~
electron <multi-tenant-electon-host-directory> :<application_name> <tenant-application-specific-arguments...>
~~~
For example, if the current directory is the [top directory of the multi-tenant Electon host](https://github.com/SAKryukov/multi-tenant-electron-host), the application can be started as

~~~
electron . :Editor <data_file>
~~~

or

~~~
electron . :Editor <data_file>
~~~

### As the Packaged Application

If the application is packaged, the executable file is `mt-host` (`mt-host.exe` for Windows). As the tenant applications use a considerable portion of shared code, they cannot be executed on the packaged form. If someone packages a separate tenant application, the executable will show an error message with the explanation of the recommended ways of execution, and then terminate.

In the packaged form, the application can be started as

~~~
mt-host :<tenant-application-name> <data-file(s)>
~~~

For example,

~~~
mt-host :Editor <data-file>
~~~

or

~~~
mt-host :Personal.Database <data-file>
~~~

If a tenant application name is not specified, a default application will be started:

~~~
mt-host <data-file>
~~~

In this case, the list of available tenant applications is shown in a console.

