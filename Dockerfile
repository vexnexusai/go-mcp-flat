ARG VERSION="dev"

FROM golang:1.23.7 AS build
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY cmd ./cmd
# Add any other needed Go source directories here
RUN CGO_ENABLED=0 go build -o github-mcp-server cmd/github-mcp-server/main.go

# Build Node.js wrapper
FROM node:20 AS wrapper
WORKDIR /app
COPY package.json ./
COPY server.js ./
RUN npm install

# Final image
FROM gcr.io/distroless/base-debian12
WORKDIR /server
COPY --from=build /build/github-mcp-server ./github-mcp-server
COPY --from=wrapper /app/server.js ./server.js
COPY --from=wrapper /app/node_modules ./node_modules
COPY --from=wrapper /app/package.json ./package.json
EXPOSE 8081
CMD ["/server/server.js"]
