# Akura Astrology Automation

This project is designed to automate the cleanup and deployment processes for the Akura Astrology application. It includes scripts for identifying unused files, checking for duplicates, and automating deployment to services like Render or Netlify.

## Project Structure

```
akura-astrology-automation
├── scripts
│   ├── cleanup.ts               # Script to identify and delete unused files/components
│   ├── deploy.ts                # Script for deployment automation
│   ├── check-unused-and-duplicates.ts # Script to check for duplicate files and unused components
│   └── utils.ts                 # Utility functions for reuse across scripts
├── config
│   └── deployment.config.json    # Configuration for deployment settings
├── src
│   └── index.ts                 # Entry point for the application
├── package.json                  # npm configuration file
├── tsconfig.json                 # TypeScript configuration file
└── README.md                     # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd akura-astrology-automation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure deployment settings**:
   - Update the `config/deployment.config.json` file with your deployment-related settings.

## Usage

- **Run Cleanup Script**:
  To identify and optionally delete unused files/components, run:
  ```bash
  npx ts-node scripts/cleanup.ts
  ```

- **Run Deployment Script**:
  To automate the deployment process, execute:
  ```bash
  npx ts-node scripts/deploy.ts
  ```

- **Check for Unused and Duplicate Files**:
  To validate the project for duplicate files and unused components, use:
  ```bash
  npx ts-node scripts/check-unused-and-duplicates.ts
  ```

## Scripts Overview

- **cleanup.ts**: Identifies and deletes unused files/components in the project.
- **deploy.ts**: Automates the deployment process to services like Render or Netlify.
- **check-unused-and-duplicates.ts**: Checks for duplicate files and unused components.
- **utils.ts**: Contains utility functions for file handling and logging.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.