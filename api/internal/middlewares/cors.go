package middlewares

import (
	"net/http"
	"strings"
)

// CORSMiddleware envolve as rotas da API e injeta os cabeçalhos de permissão
func CORSMiddleware(next http.Handler, allowedOrigin string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Pular CORS middleware para socket.io (deixar o socket.io lidar com CORS)
		if strings.HasPrefix(r.URL.Path, "/socket.io/") {
			// Não fazer nada - deixar Socket.io lidar com tudo
			next.ServeHTTP(w, r)
			return
		}

		// Pega a origem real de quem fez a requisição (o navegador)
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Responde o Preflight imediatamente com 200 OK
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
