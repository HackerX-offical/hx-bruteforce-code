# Credential Tester Project

This project contains two robust implementations of a credential testing tool - one in Python and one in TypeScript/Node.js. Both tools are functionally identical and designed for long-running, reliable testing.

## Project Structure

```
Test/
├── python/                 # Python implementation
│   ├── main.py            # Main Python script
│   ├── requirements.txt   # Python dependencies
│   └── README.md          # Python specific docs
├── nodejs/                # Node.js/TypeScript implementation
│   ├── src/
│   │   └── main.ts        # Main TypeScript source
│   ├── package.json       # Node.js dependencies
│   └── README.md          # Node.js specific docs
└── README.md              # This file
```

## Shared Features (Both Versions)

- **Resume Capability**: Automatically saves progress to `checkpoint.json`. You can stop and restart the script at any time without losing progress.
- **Instant Logging**: Successfully found credentials are immediately saved to `valid_credentials.txt`.
- **Graceful Shutdown**: Handles interruptions (Ctrl+C) safely by saving state before exiting.
- **Rate Limiting**: Respects server resources with appropriate delays.
- **Retry Logic**: Automatically retries failed requests due to network issues.
- **Cross-Platform**: Works seamlessly on Windows, Mac, and Linux.

## Quick Start

### Python Version

```bash
cd python
pip install -r requirements.txt or pip3 install -r requirements.txt
python main.py or python3 main.py
```

### Node.js Version

```bash
cd nodejs
npm install
npm run dev
```

## Configuration

**Authorized targets only.** Configure via environment variables (Node.js). Defaults use a small ID/password window for lab runs — widen only with written permission.

| Variable | Purpose |
| --- | --- |
| `HBF_BASE_URL` | Required. Base URL of the authorized login target |
| `HBF_LOGIN_URL` | Login POST URL (default: `{BASE_URL}/`) |
| `HBF_SUCCESS_MARKERS` | Comma-separated success substrings (default: `dashboard`) |
| `HBF_ID_START` / `HBF_ID_END` | User id numeric range |
| `HBF_PASS_START` / `HBF_PASS_END` | Password numeric range |

Example (local lab):

```bash
export HBF_BASE_URL="https://auth.lab.example"
export HBF_ID_START=1000
export HBF_ID_END=1002
export HBF_PASS_START=10000
export HBF_PASS_END=10002
cd nodejs && npm run build && npm start
```

##  Important Safety Notice

**ETHICAL USE ONLY**: These tools are designed for educational purposes and authorized penetration testing only.

**Requirements:**

- You MUST have explicit written permission to test the target website.
- Respect server resources and implement appropriate rate limiting.
- Consider the massive scale of testing (billions of combinations).

**Legal Disclaimer**: The authors are not responsible for any misuse of these tools. Users are solely responsible for ensuring they have proper authorization.

## Comparison

| Feature       | Python              | Node.js               |
| ------------- | ------------------- | --------------------- |
| **Library**   | `requests`          | `axios`               |
| **Parsing**   | None (String check) | None (String check)   |
| **Speed**     | Fast                | Fast (Async)          |
| **File Size** | Small               | Medium (node_modules) |
| **Setup**     | `pip install`       | `npm install`         |

Choose whichever language you are more comfortable with; the results will be identical.

## License

Licensed under the [HackerX License](./LICENSE). Redistributions must retain copyright,
license text, and [NOTICE](./NOTICE) attribution per the license terms.
