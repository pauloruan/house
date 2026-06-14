package middlewares

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware intercepta a requisição, valida o JWT e injeta o ID do usuário no Contexto
func AuthMiddleware(secret string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Acesso não autorizado: Token ausente", http.StatusUnauthorized)
			return
		}

		// O cabeçalho deve ser "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Acesso não autorizado: Token mal formatado", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Acesso não autorizado: Token inválido ou expirado", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Erro ao processar as permissões do token", http.StatusUnauthorized)
			return
		}

		// Extrai o user_id do payload do token
		userID, ok := claims["user_id"].(string)
		if !ok {
			// Fallback caso você tenha salvo como "sub" na criação do token
			userID, ok = claims["sub"].(string)
			if !ok {
				http.Error(w, "Acesso não autorizado: ID não encontrado no token", http.StatusUnauthorized)
				return
			}
		}

		// Injeta o ID no contexto da requisição e passa para o próximo handler (o userHandler.GetMe)
		ctx := context.WithValue(r.Context(), "user_id", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
