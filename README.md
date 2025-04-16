# Pearanoid
> 🟢 **Pearanoid** is a self-hosted, retro-flavored password manager where security meets simplicity.  
> Inspired by the clean, stripped-down aesthetics of Teenage Engineering — minimalism, clarity, and encryption.

---


A lightweight, encrypted, single-user password manager built with **Go** and **Svelte**.  
All password data is encrypted client-side with WebCrypto and securely stored on the server.  
Designed for self-hosting and maximum privacy.

---

## Features

- 🔐 End-to-end encryption with AES-GCM (via WebCrypto)
- 🔑 Single master password authentication
- 🗃️ Optional user-defined sections to organize credentials
- 📝 Store username, email, and freeform notes per entry
- ✂️ Clipboard copy, password generator, auto-lock on inactivity
- 🧠 Fully client-side vault decryption; backend sees only encrypted blobs

---

## Tech Stack

- **Frontend**: SvelteKit + TailwindCSS
- **Backend**: Go (Golang) HTTP API
- **Encryption**: WebCrypto + PBKDF2/Argon2
- **Storage**: SQLite (encrypted vault only)
- **Deployment**: Docker + Fly.io or self-hosted

---

## Project Structure (Monorepo)

```
secure-vault/
├── backend/           # Go API server
│   ├── main.go
│   └── vault.json     # Encrypted vault
├── frontend/          # SvelteKit app
│   ├── src/
│   └── public/
├── docker-compose.yml
└── fly.toml
```

---

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/secure-vault.git
cd secure-vault
```

### 2. Run Locally (Docker Compose)

```bash
docker-compose up --build
```

### 3. Build Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment (Fly.io)

1. Install Fly CLI: `flyctl auth login`
2. Create app: `fly launch`
3. Create volume: `fly volumes create vault_data --size 1`
4. Deploy backend:

```bash
cd backend
fly deploy
```

---

## Roadmap

- [ ] Vault export/import
- [ ] Offline mode
- [ ] Markdown rendering in notes
- [ ] Optional TOTP field

---

## Security Notes

- No plaintext passwords are ever sent to or stored on the server.
- Encryption keys are derived from your master password on the client using PBKDF2 or Argon2.
- Vault is encrypted using AES-GCM, ensuring both confidentiality and integrity.
- Backend requires secure token authentication for read/write operations.

---

## License

MIT License © 2025


---

## Requirements

### Must Have
- Client-side encryption using WebCrypto (AES-GCM)
- Single-user authentication via master password
- Secure, encrypted vault storage on server using SQLite
- CRUD operations on password entries
- Go backend with REST API over HTTPS
- Stateless server, client-only decryption
- Key derivation via PBKDF2 or Argon2

### Should Have
- Responsive UI built with Svelte
- Copy-to-clipboard, password generator
- Auto-lock on inactivity

### Could Have
- Vault export/import
- Offline capability
- Self-destruct or wipe feature

### Won’t Have (MVP)
- Multi-user support
- Browser extension
- Cloud syncing

---

## Method

### Architecture Overview

- **Frontend (Svelte)**:
  - Inputs master password and derives encryption key
  - Decrypts/encrypts vault using AES-GCM
  - Manages credential entries and sections
- **Backend (Go)**:
  - Exposes `/vault` GET and POST endpoints
  - Stores vault in SQLite database
  - Requires token or HMAC authentication
- **Vault Format**:
  ```json
  {
    "version": 1,
    "entries": [
      {
        "id": "uuid",
        "name": "Gmail",
        "username": "john.doe",
        "email": "john@gmail.com",
        "password": "encrypted",
        "section": "Personal",
        "notes": "Recovery email is..."
      }
    ]
  }
  ```

---

## Implementation Steps

### Step 1: Monorepo Setup
- Create `/frontend` and `/backend`
- Add shared `docker-compose.yml` and `fly.toml`

### Step 2: Frontend
- SvelteKit + Tailwind
- WebCrypto AES-GCM + PBKDF2/Argon2
- UI for managing credentials and sections

### Step 3: Backend
- Go HTTP server
- Endpoints: `GET /vault`, `POST /vault`
- Encrypted vault stored in SQLite
- HMAC-based token authentication

### Step 4: Integration
- Frontend ↔ Backend API connection
- Local dev with Docker Compose

### Step 5: Deployment
- Fly.io with volume for vault
- HTTPS + custom domain

### Step 6: Polish
- Vault import/export
- UI refinement and accessibility
- Security README

---

## Milestones

### Milestone 1: Monorepo Bootstrapping
- Project structure, README, config files

### Milestone 2: Frontend MVP
- WebCrypto, decryption, CRUD UI

### Milestone 3: Backend MVP
- API, SQLite storage, auth

### Milestone 4: Integration & Local Test
- Connect frontend and backend
- Round-trip encryption testing

### Milestone 5: Fly.io Deployment
- Backend deploy with volume and TLS
- Optional: static frontend hosting

### Milestone 6: Final Polish
- Vault import/export
- Auto-lock
- Full documentation
