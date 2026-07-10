grommunio-desk 1.2.0 (2026-06-30)
=================================

Enhancements:

* Spell checking based on the preferred system languages: new
  ``spellChecker`` module that resolves and sets the spell checker languages
  per session
* Right-click context menu for all views (new ``contextMenu`` module),
  offering spelling suggestions and standard edit actions
* Zoom functionality for the ``ServerView`` with new app menu entries for
  zooming in / out and resetting to the default zoom level; the zoom level
  is stored per server (new ``zoomLevel`` server property)
* Each server now uses its own persistent session partition, isolating
  cookies and sessions between servers
* Title bar server menu option to edit the name of a configured server (new
  ``InputDialog`` and ``ServerNameDialog``)
* New app menu option to reload the current ``ServerView``
* New ``ServerTypeIcon`` component with dedicated mail and chat server icons
  in the title bar dropdown menu
* Config data is now validated against a schema (using ``zod``) when loaded;
  new ``version`` and ``lastUsedServerId`` config properties
* New config migration module that automatically upgrades existing config
  data to the current schema version
* New ``ViewManager.updateServer`` method; the ``getCurrServer`` and
  ``updateServerInStore`` methods were improved
* ``SelectDialog``, the app menu, and the dialog and ``StartPage`` type
  definitions were improved

Changes:

* Updated Electron to 42.3.3
* Replaced the ``View`` interface with an abstract class
* Separate ``tsconfig`` files for the main, renderer, and preload processes
  (now located in the root folder) plus a dedicated webpack config for
  preload scripts
* ESLint configuration was improved
* Squirrel maker icon URL was updated

Fixes:

* Fixed missing macOS keyboard shortcuts in the app menu
* ``ServerView`` no longer reports a load failure when only a single
  sub-request fails and the page is still working
* Server URL validation for web servers was fixed
* Wrong ``app.name`` was fixed, including a migration from the legacy
  user-data directory
* Newly added views are now focused to avoid focus issues
* Fixed bugs in ``ButtonsContainer`` for user dialogs
* Fixed bug with webpack's ForkTsChecker plugin


grommunio-desk 1.1.0 (2026-05-03)
=================================

Enhancements:

* The ``Server`` type now carries a ``system`` property (type and version)
* Server URL validation now supports grommunio chat servers
* New ``SelectField`` component and ``SelectDialog`` for selection-based user
  dialogs
* ``InputField`` was extracted into its own component class
* Dialog type definitions were split across multiple files and the
  ``UserDialogButton`` type gained ``text`` and ``disabled`` properties
* New ``createDialogObject`` helper function for assembling dialog objects
* ``DialogView`` was made more modular and its i18n section reworked
* Mailto URL handler with accompanying Windows registry helper functions

Changes:

* New script to generate the ``AppXManifest`` for MSIX packaging
* Package updates and clean-up of deprecated ``tsconfig`` options

Fixes:

* Single-instance-lock behaviour was improved
* Fixed issue with ``electron-log`` preload script
* Fixed bug in ``InputField``


grommunio-desk 1.0.0 (2026-03-31)
=================================

Enhancements:

* Multi-server support: the main view was split into a dedicated start view
  and server view, managed by a new ``ViewManager`` with view caching
* Title bar gained a server dropdown menu, an option to remove servers and
  an app menu entry to switch between configured servers
* New ``DialogView`` (e.g. for user confirmations) with dedicated IPC channels
* Single-instance lock so only one application instance can run at a time
* Tray menu was added
* Added Windows MSIX and Squirrel makers
* Added macOS DMG maker
* Added application icons for all distributables (Windows ``.ico``, macOS
  ``.icns`` / ``.icon``, Linux ``.png``)
* New ``EnvConfig`` class to retrieve build options from an environment file

Changes:

* Switched the packager from electron-builder to Electron Forge

Fixes:

* Fixed macOS title bar rendering bug
* Fixed oversized macOS tray icon
* Fixed Squirrel startup handling and the app model id on Windows
* Fixed Windows notifications
* Corrected ``validateServerUrl`` edge cases
* Fixed issue with temporarily disabled IPC channels
* Fixed Dev tools issue for ``NotificationView``


grommunio-desk 0.9.0 (2026-01-31)
=================================

Initial release of grommunio Desk, establishing the application baseline.

* Electron + TypeScript + Webpack project setup
* ESLint configuration and Husky-based pre-commit git hooks
* Application structure with a ``MainWindow`` class in the main process, IPC
  handlers, and view classes
* ``StartPage`` for adding and configuring a server, including server URL
  validation and input fields
* Title bar with the application menu and a separate switch-server button
* About panel with application metadata
* Logging module
* Internationalization (i18n) module
* Persistent data store for application configuration
* electron-builder configuration with initial build assets and icons
