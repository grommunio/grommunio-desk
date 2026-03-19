# grommunio Desk - Development Guide

## Project Structure

- `src/main/`: Electron main process, window/view lifecycle, IPC handlers
- `src/main/preload.ts`: Secure API bridge via `contextBridge`
- `src/renderer/`: Renderer views built with React
- `docs/` Additional documentation

## Installing dependencies

```bash
$ npm install
```

## Starting the application

```bash
$ npm start
```

## Packaging

Application packaging with Electron Forge / electron-packager

```bash
$ npm run make
```

### Creating icons

- for Windows: use an online tool (e.g. [png2ico](https://www.png2ico.com/)) to convert a 256x256 PNG file to an ICO file (use default options)

## Signing

### Signing Windows binaries - using DigiCert Keylocker

- Install the `smctl` tool: [Official Guide](https://docs.digicert.com/en/software-trust-manager/client-tools/command-line-interface/smctl.html#download-smctl-487706)
- Set your PATH environment variable correctly: [Official Guide](https://docs.digicert.com/zf/software-trust-manager/code-signing/sign-with-digicert-signing-tools/sign-binaries-with-smctl.html#-en--set-path-environment-variables-401417)
- Sync certificates: `smctl windows certsync --keypair-alias=<keypair alias>` (list keypair aliases with `smctl keypair list`)
- Sign the binary: `smctl sign --keypair-alias <keypair alias> --input <path to unsigned file or folder>`

#### Troubleshoot

- Check that you are using the right keypair alias: `smctl keypair list`
- Make sure you are connected with 2FA and have the permission to sign executables: `smctl healthcheck`
- Check that SignTool is linked correctly: `smctl healthcheck --tools` / `signtool` ([Guide to set PATH environment variable](https://docs.digicert.com/zf/software-trust-manager/code-signing/sign-with-digicert-signing-tools/sign-binaries-with-smctl.html#-en--set-path-environment-variables-401417))
- Microsoft SignTool
  - [Official Troubleshoot article](https://knowledge.digicert.com/troubleshooting/troubleshoot-keylocker-for-microsoft-signtool)
  - Error `No private key is available`
    - Follow the official article
    - Make sure that all the necessary DigiCert packages are installed (SMCTL, PKCS11 library and - especially - KSP library). You can check that in the DigiCert ONE Client (open it through the trayicon)
  - Error `SignSign() failed.`
    - Check the log
      - Run the Event Viewer app
      - Open the event log: `Event Viewer (Local)` > `Applications and Services Logs` > `Microsoft` > `Windows` > `AppxPackagingOM` > `Microsoft-Windows-AppxPackaging/Operational`
