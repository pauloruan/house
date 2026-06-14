FROM golang:1.26.2-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /my-house-api ./cmd/app/main.go


FROM alpine:latest

WORKDIR /root/

COPY --from=builder /my-house-api .
COPY docs ./docs

EXPOSE 8080

CMD ["./my-house-api"]
