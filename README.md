# hx-bruteforce-code

Dual Python and Node credential testers with checkpoint resume for authorized targets.

## Why this exists

Long-running login tests need checkpoints and rate limits. Implementations mirror each other for lab comparisons.

## Features

- Resume via `checkpoint.json`
- Env-driven target URLs (Node)
- Valid hits appended to `valid_credentials.txt`

## Install

```bash
git clone https://github.com/HackerX-official/hx-bruteforce-code.git
cd hx-bruteforce-code
cd nodejs && npm install
cd ../python && pip install -r requirements.txt
```

## Quick start

```bash
cd nodejs && HBF_BASE_URL=https://authorized-lab.example npm run dev
```

## Output

Checkpoint JSON and `valid_credentials.txt` on success.

## Develop

```bash
cd nodejs && npm test
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module layout and extension points.

## Ethics

Use only on systems and content you are **authorized** to test. See [SECURITY.md](./SECURITY.md).

## License

Licensed under the [HackerX License](./LICENSE). Redistributions must retain copyright,
license text, and [NOTICE](./NOTICE) attribution per the license terms.
