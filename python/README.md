# Credential Tester - Python Version

This is a Python implementation of a credential testing tool for ethical hacking purposes.

## Features

- **Cross-Platform**: Optimized for both Windows and Mac.
- **Resumable**: Automatically saves progress to `checkpoint.json`. If interrupted (e.g., power loss, Ctrl+C), it resumes exactly where it left off.
- **Persistent Logging**: Finds are immediately saved to `valid_credentials.txt`.
- **Robust**: Handles network errors and retries gracefully.

## Prerequisites

- [Python 3.7+](https://www.python.org/downloads/)

## Installation

1. Navigate to the python directory:

   ```bash
   cd python
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the script:

```bash
python main.py
```

or on Mac/Linux:

```bash
./main.py
```

## Output Files

- `valid_credentials.txt`: Contains all successfully found username/password combinations.
- `checkpoint.json`: Stores the current progress. Do not delete this if you want to resume.

## Safety & Ethics

This tool is for educational and authorized testing purposes only. Always ensure you have explicit permission before testing any website.
