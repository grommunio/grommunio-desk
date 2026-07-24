grommunio Desk - Development Guide
==================================

Project Structure
-----------------

* ``src/main/``: Electron main process, window/view lifecycle, IPC handlers
* ``src/main/preload.ts``: Secure API bridge via ``contextBridge``
* ``src/renderer/``: Renderer views built with React
* ``docs/`` Additional documentation

Installing Dependencies
-----------------------

.. code-block:: bash

   $ npm install

Starting the Application
------------------------

.. code-block:: bash

   $ npm start

Packaging
---------

Application packaging with Electron Forge / electron-packager.

.. code-block:: bash

   $ npm run package
   $ npm run make

Environment Variables
~~~~~~~~~~~~~~~~~~~~~

Set the environment variables in the ``.env`` file.

For Windows builds:

- ``WINDOWS_PUBLISHER``: The X.500 distinguished name of the publishing company.
  It must match the subject of the certificate used to sign the application.
- ``WINDOWS_KIT_VERSION``: Windows Kit version used for the ``MinVersion`` and
  ``MaxVersionTested`` settings in the package manifest.

For macOS builds:

- ``APPLE_ID``: The Apple ID associated with your Apple Developer account.
- ``APPLE_PASSWORD``: App-specific password for your Apple account. (This is not
  the password for your Apple account.
  `Guide to generate an app-specific password <https://support.apple.com/en-us/102654>`__.)
- ``APPLE_TEAM_ID``: The company's Apple Team ID.
- ``APPLE_SIGNING_IDENTITY``: The name of the certificate used for signing. (Use
  the command ``security find-identity -p codesigning -v`` to find valid
  identities.)

Snap Package
~~~~~~~~~~~~

* Create a Snap package: ``npm run make.snap`` (automatically runs
  ``generate-snapcraft-yaml``)
* Install a local Snap package (for debugging purposes):
  ``snap install --dangerous <my.snap>``

Creating Icons
~~~~~~~~~~~~~~

* For Windows: use an online tool (e.g. `png2ico <https://www.png2ico.com/>`__)
  to convert a 256x256 PNG file to an ICO file (use default options)

Signing
-------

Only necessary for Windows and macOS.

Signing Windows Binaries - using DigiCert Keylocker
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* Install the ``smctl`` tool:
  `Official Guide <https://docs.digicert.com/en/software-trust-manager/client-tools/command-line-interface/smctl.html#download-smctl-487706>`__
* Set your PATH environment variable correctly:
  `Official Guide <https://docs.digicert.com/zf/software-trust-manager/code-signing/sign-with-digicert-signing-tools/sign-binaries-with-smctl.html#-en--set-path-environment-variables-401417>`__
* Sync certificates: ``smctl windows certsync --keypair-alias=<keypair alias>``
  (list keypair aliases with ``smctl keypair list``)
* Sign the binary:
  ``smctl sign --keypair-alias <keypair alias> --input <path to unsigned file or folder>``

Troubleshoot
^^^^^^^^^^^^

* Check that you are using the right keypair alias: ``smctl keypair list``
* Make sure you are connected with 2FA and have the permission to sign
  executables: ``smctl healthcheck``
* Check that SignTool is linked correctly: ``smctl healthcheck --tools`` /
  ``signtool``
  (`Guide to set PATH environment variable <https://docs.digicert.com/zf/software-trust-manager/code-signing/sign-with-digicert-signing-tools/sign-binaries-with-smctl.html#-en--set-path-environment-variables-401417>`__)
* Microsoft SignTool

  * `Official Troubleshoot article <https://knowledge.digicert.com/troubleshooting/troubleshoot-keylocker-for-microsoft-signtool>`__
  * Error ``No private key is available``

    * Follow the official article
    * Make sure that all the necessary DigiCert packages are installed (SMCTL,
      PKCS11 library and - especially - KSP library). You can check that in the
      DigiCert ONE Client (open it through the trayicon)

  * Error ``SignSign() failed.``

    * Check the log

      * Run the Event Viewer app
      * Open the event log: ``Event Viewer (Local)`` >
        ``Applications and Services Logs`` > ``Microsoft`` > ``Windows`` >
        ``AppxPackagingOM`` > ``Microsoft-Windows-AppxPackaging/Operational``

Publishing
----------

Snap Store
~~~~~~~~~~

* Log in to your Snapcraft account: ``snapcraft login``
* Upload and publish the app:
  ``snapcraft upload --release=<release-channel> <my.snap>``
