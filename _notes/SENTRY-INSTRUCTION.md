## Automatic Configuration (Recommended)

Configure your app automatically by running the [Sentry wizard](https://docs.sentry.io/platforms/javascript/guides/nuxt/#install) in the root of your project.

```bash
npx @sentry/wizard@latest -i nuxt --saas  --org self-12e --project javascript-nuxt
```

## Manual Configuration

Alternatively, you can also set up the SDK manually, by following the [manual setup docs](https://docs.sentry.io/platforms/javascript/guides/nuxt/manual-setup/).

If you already have the configuration for Sentry in your application, and just need this project's (javascript-nuxt) DSN, you can find it below:

```
https://519ae487ff5b5d3d27bd4e89a2f20b80@o4511691336122368.ingest.de.sentry.io/4511691340709968
```

## Verify

Build and run your application and visit `/sentry-example-page` if you have set it up. Click the button to trigger a test error.

Or, throw an error in a simple vue component.

```html
<script setup>
  const triggerError = () => {
    throw new Error('Nuxt Button Error')
  }
</script>

<template>
  <button id="errorBtn" @click="triggerError">Trigger Error</button>
</template>
```

If you see an issue in your Sentry Issues, you have successfully set up Sentry.
