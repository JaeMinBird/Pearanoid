# Pearanoid

🟢 **Pearanoid** is a self-hosted, retro-flavored password manager where security meets simplicity.  
Inspired by the clean, stripped-down aesthetics of Teenage Engineering — minimalism, clarity, and encryption.

---

## Overview

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
- **Backup**: Litestream replication to Amazon S3
- **Deployment**: Docker + Fly.io

---

## Project Structure

```
secure-vault/
├── backend/           # Go API server
│   ├── main.go
│   ├── vault.db       # Encrypted vault (via SQLite)
│   └── litestream.yml # S3 replication config
├── frontend/          # SvelteKit app
│   ├── src/
│   └── public/
├── docker-compose.yml
└── fly.toml
```

---

## Architecture Overview

- **Frontend (Svelte)**:
  - Inputs master password and derives encryption key
  - Decrypts/encrypts vault using AES-GCM
  - Manages credential entries and sections

- **Backend (Go)**:
  - Exposes `/vault` GET and POST endpoints
  - Stores vault in SQLite (`vault.db`)
  - Requires token or HMAC authentication
  - Runs behind Litestream to replicate encrypted vault to S3 for durability

- **Data Storage**:
  - SQLite stores encrypted vault file locally at `/data/vault.db`
  - Litestream replicates changes to Amazon S3 (`s3://pearanoid-backups/vault`)
  - No plaintext credentials ever stored or transmitted

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

## Deployment (Fly.io + Litestream)

### 1. Create S3 Bucket
- Name: `pearanoid-backups`
- Region: e.g., `us-west-1`

### 2. Set AWS Secrets on Fly.io

```bash
fly secrets set AWS_ACCESS_KEY_ID=your-key-id
fly secrets set AWS_SECRET_ACCESS_KEY=your-secret
```

### 3. Create Volume for Vault Data

```bash
fly volumes create vault_data --size 1
```

### 4. Update `fly.toml`

```toml
[mounts]
  source = "vault_data"
  destination = "/data"
```

### 5. Add `litestream.yml`

```yaml
dbs:
  - path: /data/vault.db
    replicas:
      - type: s3
        bucket: pearanoid-backups
        path: vault
        endpoint: s3.amazonaws.com
```

### 6. Update Backend Dockerfile

```Dockerfile
FROM golang:1.20 as builder
WORKDIR /app
COPY . .
RUN go build -o pearanoid main.go

FROM alpine
RUN apk add --no-cache litestream ca-certificates
COPY --from=builder /app/pearanoid /usr/local/bin/
COPY litestream.yml /etc/litestream.yml

ENTRYPOINT ["litestream", "replicate", "-config", "/etc/litestream.yml", "/usr/local/bin/pearanoid"]
```

### 7. Deploy

```bash
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
- Litestream ensures offsite durability without compromising encryption.

---

## License

MIT License © 2025