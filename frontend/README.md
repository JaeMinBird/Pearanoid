# Pearanoid Frontend

This directory contains the SvelteKit-based frontend for the Pearanoid password manager.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file in this directory with the following variables:

```
VITE_API_URL=http://localhost:8080
```

## Building for Production

```bash
npm run build
```

## Development Notes

- All encryption/decryption happens client-side using the WebCrypto API
- The master password is never sent to the server
- The vault is encrypted/decrypted entirely in the browser 