# Hosted GoatCounter integration

The implementation is a git-splice at `integrations/goatcounter`, shared with
both other sites. The Netlify entry point imports it; browser script URLs and
collection routes remain configured in this site's existing files.

Before deploying this migration, add `GOATCOUNTER_SITE=roschaefer` to this
Netlify site's production environment with Functions scope. Keep the existing
`GOATCOUNTER_API_TOKEN`, with permission to count pageviews. Redeploy after
changing environment variables. Edge Functions cannot read variables from
`netlify.toml`.

Run the shared tests from this site's root:

```sh
node --experimental-strip-types integrations/goatcounter/goatcounter.test.ts
```

See `integrations/goatcounter/README.md` for the integration's API and setup.
