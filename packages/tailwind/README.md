# M3 Tokens

This package provide design tokens as classes.

For color, it use [material-color-utilities](https://github.com/material-foundation/material-color-utilities) internally, so all you need to do is providing a source color, then palettes are automatically generated.

## Install

```sh
npm i -D m3-tokens
```

## Setup

```js
// tailwind.config.js

plugins: [
  require('m3-tokens/tailwind')({
    source: '#6750a4' // Source color for your theme.
  })
]
```

## Usage

```html
<button class="px-6 py-2.5 bg-surface1 typescale-label-large text-primary shadow-1 rounded-full">
  Button
</button>
```
