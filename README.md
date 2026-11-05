# BookMint

BookMint is a React Native reading platform focused on discovering, reading, and discussing books. The current workspace includes browsing surfaces, search, libraries, PDF reading, uploads, notifications, profile flows, and service modules for public-book data, AI-assisted book chat, and real-time communication.

## Highlights

- Home, trending, and top-rated book experiences
- Personal library and saved reading flows
- PDF reader integration
- Global search and book detail components
- Book uploads using document and image pickers
- Notifications and profile surfaces
- Socket.IO client integration for real-time features
- Public book data and book-chat service modules

## Repository structure

| Directory | Purpose |
| --- | --- |
| `src/components/` | Reusable reading and navigation UI |
| `src/services/` | Book, chat, API, and socket service integrations |
| `src/config/` | Local service configuration boundaries |
| `src/theme/` | Design tokens and themes |
| `src/utils/` | Shared utilities |

## Run locally

Complete the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment), then install dependencies:

```bash
npm install
npm start
```

In a second terminal:

```bash
npm run android
# or
npm run ios
```

For iOS, install CocoaPods dependencies after native dependency changes:

```bash
bundle install
bundle exec pod install --project-directory=ios
```

## Configuration

Review the files in `src/config/` before running integrations. Keep API keys, backend URLs, and AI credentials in local configuration; never commit secrets to the repository.

## Verification

```bash
npm test
npm run lint
```

## Project status

This repository is public and under active development.
