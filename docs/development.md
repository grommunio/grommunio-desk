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

## Building

```bash
$ npm run prod
```

and start the application

```bash
$ npm start
```

## Starting development environment

```bash
$ npm run dev
```

## Packaging

Application packaging with `electron-builder`

```bash
$ npm run package
```

### Creating icons

- for Windows: use an online tool (e.g. [png2ico](https://www.png2ico.com/)) to convert a 256x256 PNG file to an ICO file (use default options)
