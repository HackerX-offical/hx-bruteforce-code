# hx-bruteforce-code architecture

Dual implementation (Python + Node.js) credential **testing harness** for authorized engagements.

## Node.js layout

```
nodejs/src/
  config.ts          # Env-driven target + ranges (HBF_*)
  checkpoint.ts      # Resume state serialize/parse
  loginSuccess.ts    # Configurable success heuristics
  main.ts            # Async loop, rate limit, checkpoint I/O
```

## Python layout

See `python/README.md` — mirror feature set; align env configuration when extending.

## Safety

No hardcoded production targets. `HBF_BASE_URL` is required before the Node runner starts.
