# Credential Tester - Node.js/TypeScript Version

This is a TypeScript/Node.js implementation of a robust credential testing tool, functionally equivalent to the Python version.

## Features

- **Cross-Platform**: Optimized for both Windows and Mac.
- **Resumable**: Automatically saves progress to `checkpoint.json`. If interrupted (e.g., power loss, Ctrl+C), it resumes exactly where it left off.
- **Persistent Logging**: Finds are immediately saved to `valid_credentials.txt`.
- **Robust**: Handles network errors and retries gracefully.
- **TypeScript**: Built with strong typing for reliability.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the nodejs directory:

   ```bash
   cd nodejs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development Mode (with ts-node)

```bash
npm run dev
```

### Production Mode

Build and run the optimized JavaScript:

```bash
npm run build
npm start
```

## Output Files

- `valid_credentials.txt`: Contains all successfully found username/password combinations.
- `checkpoint.json`: Stores the current progress. Do not delete this if you want to resume.

## Safety & Ethics

This tool is for educational and authorized testing purposes only. Always ensure you have explicit permission before testing any website.
