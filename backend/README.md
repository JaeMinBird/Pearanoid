# Pearanoid Backend

This directory contains the Go-based backend for the Pearanoid password manager.

## Local Development

### Prerequisites

- Go 1.20 or higher
- Docker (optional, for containerized development)

### Running the Backend

1. Build and run the Go server:

```bash
go build -o pearanoid main.go
./pearanoid
```

2. The server will start on port 8080 by default. You can configure the port using the `PORT` environment variable.

## Environment Variables

- `PORT`: HTTP server port (default: 8080)
- `DATA_PATH`: Path to store the vault data (default: /data)
- `AUTH_TOKEN`: Authentication token for API access (if not set, all requests are allowed - for development only)

## API Endpoints

- `GET /api/health`: Health check endpoint
- `GET /api/vault`: Retrieve the encrypted vault
- `POST /api/vault`: Save the encrypted vault

## Docker

To build and run the backend using Docker:

```bash
docker build -t pearanoid-backend .
docker run -p 8080:8080 -v vault_data:/data pearanoid-backend
```

## S3 Backups with Litestream

The backend uses Litestream to replicate the SQLite database to S3. To enable this feature, set the following environment variables:

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

## Production Deployment

For production deployment on Fly.io:

1. Create a volume for data storage:

```bash
fly volumes create vault_data --size 1
```

2. Set required secrets:

```bash
fly secrets set AUTH_TOKEN=your-secure-token
fly secrets set AWS_ACCESS_KEY_ID=your-key-id
fly secrets set AWS_SECRET_ACCESS_KEY=your-secret
```

3. Deploy the application:

```bash
fly deploy
``` 