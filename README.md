<h1 align="center"><a href="https://flowoss.com">Flow - Open Source Software (OSS)</a></h1>

<h2 align="center">Redefine ePub reader</h2>

<p align="center">Free. Open source. Browser-based.</p>

<p align="center"><img src="apps/website/public/screenshots/01.webp"/>

</p>

## Features

- Grid layout
- Search in book
- Image preview
- Custom typography
- Highlight and Annotation
- Theme
- Share/Download book with link
- Data export
- Cloud storage

For planed features, see our [roadmap](https://pacexy.notion.site/283696d0071c43bfb03652e8e5f47936?v=b43f4dd7a3cb4ce785d6c32b698a8ff5).

## Development

### Prerequisites

- [Node.js](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- [Git](https://git-scm.com/downloads)

### Clone the repo

```bash
git clone https://github.com/pacexy/flow
```

### Install the dependencies

```bash
pnpm i
```

### Setup the environment variables

Copy and rename all `.env.local.example`s to `.env.local` and setup the environment variables.

### Run the apps

```bash
pnpm dev
```

## Self-hosting

Before self-hosting, you should [setup the environment variables](#setup-the-environment-variables).

### Docker

You can use docker-compose:

```sh
docker compose up -d
```

Or build the image and run it manually:

```sh
docker build -t flow .
docker run -p 3000:3000 --env-file apps/reader/.env.local flow
```

## Contributing

There are many ways in which you can participate in this project, for example:

- [Submit bugs and feature requests](https://github.com/pacexy/flow/issues/new), and help us verify as they are checked in
- [Submit pull requests](https://github.com/pacexy/flow/pulls)

## Credits

- [Epub.js](https://github.com/futurepress/epub.js/)
- [React](https://github.com/facebook/react)
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org)
- [Vercel](https://vercel.com)
- [Turborepo](https://turbo.build/repo)
