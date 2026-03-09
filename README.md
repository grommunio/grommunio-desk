# grommunio Desk

grommunio Desk is the desktop client for grommunio, built with Electron and React for Windows, macOS and Linux.

It provides direct access to your grommunio environment through a desktop-native window with an integrated server selection, persistent local configuration and OS-native notifications.

## At A Glance

- Cross-platform desktop application for grommunio
- Electron-based architecture
- Server profile management with persistent local storage and server cookies
- Built-in server URL validation
- OS-native notifications
- Background process with tray icon

## Compatibility

- Node.js 22+
- npm 10+
- Supported desktop platforms:
  - Linux
  - macOS
  - Windows

## Getting Started

### Installation

Download and install the latest release from:

- [www.grommunio.com/download](https://www.grommunio.com/download/)

### Configuration Files

grommunio Desk stores application data in the `userData` directory.

Typical locations are:

- Linux: `~/.config/grommunio-desk/config.json`
- macOS: `~/Library/Application Support/grommunio-desk/config.json`
- Windows: `%APPDATA%\\grommunio-desk\\config.json`

### Log Files

You can enable file logging in the configuration. Following options are supported:

```ts
fileLogLevel: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly' | false
```

When file logging is enabled, logs are written to:

- Linux: `~/.config/grommunio-desk/logs/main.log` and `~/.config/grommunio-desk/logs/renderer.log`
- macOS: `~/Library/Application Support/grommunio-desk/logs/main.log` and `~/Library/Application Support/grommunio-desk/logs/renderer.log`
- Windows: `%APPDATA%\\grommunio-desk\\logs\\main.log` and `%APPDATA%\\grommunio-desk\\logs\\renderer.log`

## Development

For prerequisites, local setup, build, development workflow and packaging, see:

- [docs/development.md](./docs/development.md)

## Support

Support is available through grommunio GmbH and its partners:

- [www.grommunio.com](https://www.grommunio.com/)

Community forum:

- [community.grommunio.com](https://community.grommunio.com/)

## Contributing

Contributions are welcome.

1. Fork the repository and create a feature branch.
2. Keep changes focused and well-tested.
3. Run `npm run test` before opening a pull request.
4. Submit a pull request with a clear technical description.

## Security

If you discover a security issue, please report it responsibly and privately to:

- [dev@grommunio.com](mailto:dev@grommunio.com)

Please avoid public disclosure before coordinated remediation.

## License

This project is licensed under the GNU Affero General Public License v3.0.

See [LICENSE.txt](./LICENSE.txt) for details.
