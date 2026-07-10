grommunio-desk 1.2.0 (2026-06-30)
=================================

Enhancements:

* Spell checking in text fields, based on your system languages
* Zoom in and out of the server view (with reset to the default zoom level)
* Right-click context menu with spelling suggestions, copy, paste, and more
* Each server now runs in its own isolated session, so logins and cookies are
  kept separate between servers
* You can now edit the name of a configured server
* New application menu option to reload the current server
* Clearer server icons in the title bar menu
* Existing settings are now automatically migrated to the new schema

Fixes:

* Fixed server URL validation for web servers
* Fixed missing keyboard shortcuts on macOS
* Fixed the loading state of the server view
* Fixed the buttons in dialog windows


grommunio-desk 1.1.0 (2026-05-03)
=================================

Enhancements:

* Added support for connecting to grommunio Chat servers
* Email links (``mailto:``) can now be opened directly in grommunio Desk

Fixes:

* Improved behaviour when grommunio Desk is launched while already running
* Fixed an issue with text input fields
* Fixed an issue with the buttons in dialog windows


grommunio-desk 1.0.0 (2026-03-31)
=================================

Enhancements:

* Multi-server support: configure multiple servers and switch between them
* Server menu in the title bar, including options to switch and remove servers,
  plus a matching entry in the application menu
* In-app dialog windows (e.g. for confirmations)
* Only a single instance of grommunio Desk can run at a time
* Added a system tray menu
* Installers are now provided for Windows (MSIX and Squirrel) and macOS (DMG)

Fixes:

* Fixed the title bar rendering on macOS
* Fixed an oversized tray icon on macOS
* Fixed application startup on Windows
* Fixed notifications on Windows
* Improved server URL validation


grommunio-desk 0.9.0 (2026-01-31)
=================================

Initial release of grommunio Desk.

* Add and configure a server, including server URL validation
* Title bar with the application menu and a switch-server button
* Settings are stored persistently between sessions
