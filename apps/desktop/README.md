# AstroBalendar Desktop App

This Electron app wraps the AstroBalendar frontend web application to provide a native desktop experience.

## Development

- Run `npm install` to install dependencies.
- Use `npm start` to launch the Electron app in development mode.
- The app loads the frontend from `http://localhost:4173` during development.
- In production, it loads the built frontend from the `frontend/dist` directory.

## Future Enhancements

- Add IPC channels for native integrations.
- Support offline mode and local PDF storage.
