FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /webhook .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /webhook .
EXPOSE 8080
CMD ["./webhook"]
