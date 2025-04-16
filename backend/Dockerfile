FROM golang:1.20 as builder
WORKDIR /app
COPY . .
RUN go build -o pearanoid main.go

FROM alpine:latest
RUN apk add --no-cache litestream ca-certificates

# Create data directory
RUN mkdir -p /data && chmod 755 /data

# Copy binary and configuration
COPY --from=builder /app/pearanoid /usr/local/bin/
COPY litestream.yml /etc/litestream.yml

# Create startup script
RUN echo '#!/bin/sh' > /usr/local/bin/start.sh && \
    echo 'litestream replicate -config /etc/litestream.yml & ' >> /usr/local/bin/start.sh && \
    echo 'pearanoid' >> /usr/local/bin/start.sh && \
    chmod +x /usr/local/bin/start.sh

EXPOSE 8080
VOLUME ["/data"]

# Entry point using the startup script
ENTRYPOINT ["/usr/local/bin/start.sh"] 