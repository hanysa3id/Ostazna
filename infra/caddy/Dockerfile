# Build Caddy with the Cloudflare DNS provider plugin (needed for wildcard DNS-01).
FROM caddy:2.8-builder AS builder
RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare

FROM caddy:2.8-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
