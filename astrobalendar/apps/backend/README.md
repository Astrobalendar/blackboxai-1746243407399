# AstroBalendar Backend Setup and Usage

## Setup

1. Copy `.env.example` to `.env` and update the `MONGODB_URI` with your MongoDB Atlas connection string.

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Backend

### Using Startup Scripts

- On Linux/macOS:

```bash
chmod +x start_backend.sh
./start_backend.sh
```

- On Windows:

Double-click `start_backend.bat` or run it from Command Prompt:

```cmd
start_backend.bat
```

### Direct Python Run

```bash
python backend_server.py
```

## Environment Variables

- `.env` file contains sensitive information and should **not** be committed to version control.

- `MONGODB_URI` must be URL-encoded, especially special characters in passwords.

## VS Code Integration

- Use the provided `.vscode/tasks.json` for easy run/debug.

## Makefile

- Use `make dev` to start the backend.

- Use `make lint` to run linters.

## Troubleshooting

- Ensure `.env` is present and correctly configured.

- Check that environment variables are loaded before starting the backend.

- Review logs for connection errors.

## Contact

For issues, please contact the development team.
