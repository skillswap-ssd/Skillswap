# SkillSwap deployment

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

## Vercel

Use Vercel's normal Next.js detection.

- Framework: Next.js
- Root Directory: `/`
- Build Command: `npm run build`

Do not force an output directory; Vercel owns the production adapter.

## Cloudflare Workers with OpenNext

SkillSwap is prepared for the current OpenNext Cloudflare Workers model rather than static-only Pages. The scripts are:

```bash
npm run preview
npm run deploy
npm run upload
```

`preview` builds the OpenNext output and runs it in the Workers runtime. `deploy` builds and deploys to Workers. `upload` is provided for non-production Workers Builds that upload a version.

Copy `wrangler.example.toml` to `wrangler.toml` for a real Cloudflare project, then set the Worker name, compatibility date, `nodejs_compat`, assets binding, and any bindings you add later.

Required environment variables currently documented in `.env.example`:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`

Keep secrets in Cloudflare dashboard secrets or `wrangler secret put NAME`. Do not commit `.env`, `.env.local`, `.env.production`, or `.dev.vars`.
