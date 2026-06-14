package main

import (
	"database/sql"
	"fmt"
	"log"
	"my-house/internal/handlers"
	"my-house/internal/middlewares"
	"my-house/internal/repositories"
	"my-house/internal/services"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Printf("⚠️ Aviso: arquivo .env não encontrado. Utilizando variáveis de ambiente do sistema.")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	jwtSecret := os.Getenv("JWT_SECRET")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("❌ Erro ao abrir conexão com banco: %v", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatalf("❌ Erro ao conectar no banco: %v", err)
	}
	fmt.Println("📦 Conectado ao banco de dados com sucesso!")

	oauthConf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	userRepo := repositories.NewUserRepository(db)
	houseRepo := repositories.NewHouseRepository(db)
	notificationRepo := repositories.NewNotificationRepository(db)
	billRepo := repositories.NewBillRepository(db)
	eventRepo := repositories.NewEventRepository(db)
	wishlistRepo := repositories.NewWishlistRepository(db)

	authService := services.NewAuthService(userRepo, os.Getenv("JWT_SECRET"))
	userService := services.NewUserService(userRepo)
	houseService := services.NewHouseService(houseRepo, userRepo)

	// Inicializar WebSocket
	wsService, err := services.NewWebSocketService()
	if err != nil {
		log.Fatalf("❌ Erro ao inicializar WebSocket: %v", err)
	}

	notificationService := services.NewNotificationService(notificationRepo, wsService)
	billService := services.NewBillService(billRepo, wsService)
	eventService := services.NewEventService(eventRepo, wsService)
	wishlistService := services.NewWishlistService(wishlistRepo, wsService)

	authHandler := handlers.NewAuthHandler(oauthConf, authService, frontendURL)
	userHandler := handlers.NewUserHandler(userService, houseService, notificationService)
	houseHandler := handlers.NewHouseHandler(houseService, wsService, notificationService, userService)
	wsHandler := handlers.NewWebSocketHandler(wsService)
	notificationHandler := handlers.NewNotificationHandler(notificationService, houseService)
	billHandler := handlers.NewBillHandler(billService, houseService, notificationService, userService)
	eventHandler := handlers.NewEventHandler(eventService, houseService, notificationService, userService)
	wishlistHandler := handlers.NewWishlistHandler(wishlistService, houseService, notificationService, userService)

	mux := http.NewServeMux()
	mux.HandleFunc("/greeting", handlers.Greeting)
	mux.HandleFunc("/health", handlers.HealthCheck)

	mux.HandleFunc("/auth/google/login", authHandler.GoogleLogin)
	mux.HandleFunc("/auth/google/callback", authHandler.GoogleCallback)

	mux.HandleFunc("/me", middlewares.AuthMiddleware(jwtSecret, userHandler.GetMe))
	mux.HandleFunc("GET /users", middlewares.AuthMiddleware(jwtSecret, userHandler.ListUsers))
	mux.HandleFunc("PUT /users", middlewares.AuthMiddleware(jwtSecret, userHandler.UpdateMe))
	mux.HandleFunc("DELETE /users", middlewares.AuthMiddleware(jwtSecret, userHandler.DeleteUser))

	// Rotas para a casa
	mux.HandleFunc("GET /house", middlewares.AuthMiddleware(jwtSecret, houseHandler.GetHouse))
	mux.HandleFunc("POST /house", middlewares.AuthMiddleware(jwtSecret, houseHandler.CreateHouse))
	mux.HandleFunc("PUT /house", middlewares.AuthMiddleware(jwtSecret, houseHandler.UpdateHouse))
	mux.HandleFunc("PATCH /house", middlewares.AuthMiddleware(jwtSecret, houseHandler.UpdateHouse))
	mux.HandleFunc("DELETE /house", middlewares.AuthMiddleware(jwtSecret, houseHandler.DeleteHouse))
	mux.HandleFunc("POST /house/leave", middlewares.AuthMiddleware(jwtSecret, houseHandler.LeaveHouse))
	mux.HandleFunc("POST /house/regenerate-invite-code", middlewares.AuthMiddleware(jwtSecret, houseHandler.RegenerateInviteCode))
	mux.HandleFunc("POST /house/join-with-invite-code", middlewares.AuthMiddleware(jwtSecret, houseHandler.JoinHouseWithInviteCode))

	// Rotas para notificações
	mux.HandleFunc("GET /notifications", middlewares.AuthMiddleware(jwtSecret, notificationHandler.GetNotifications))

	// Rotas para contas
	mux.HandleFunc("GET /bills", middlewares.AuthMiddleware(jwtSecret, billHandler.GetBills))
	mux.HandleFunc("POST /bills", middlewares.AuthMiddleware(jwtSecret, billHandler.CreateBill))
	mux.HandleFunc("PUT /bills", middlewares.AuthMiddleware(jwtSecret, billHandler.UpdateBill))
	mux.HandleFunc("DELETE /bills", middlewares.AuthMiddleware(jwtSecret, billHandler.DeleteBill))
	mux.HandleFunc("POST /bills/pay", middlewares.AuthMiddleware(jwtSecret, billHandler.PayBill))

	// Rotas para eventos
	mux.HandleFunc("GET /events", middlewares.AuthMiddleware(jwtSecret, eventHandler.GetEvents))
	mux.HandleFunc("POST /events", middlewares.AuthMiddleware(jwtSecret, eventHandler.CreateEvent))
	mux.HandleFunc("PUT /events", middlewares.AuthMiddleware(jwtSecret, eventHandler.UpdateEvent))
	mux.HandleFunc("DELETE /events", middlewares.AuthMiddleware(jwtSecret, eventHandler.DeleteEvent))
	mux.HandleFunc("POST /events/confirm", middlewares.AuthMiddleware(jwtSecret, eventHandler.ConfirmPresence))

	// Rotas para wishlist
	mux.HandleFunc("GET /wishlist", middlewares.AuthMiddleware(jwtSecret, wishlistHandler.GetItems))
	mux.HandleFunc("POST /wishlist", middlewares.AuthMiddleware(jwtSecret, wishlistHandler.AddItem))
	mux.HandleFunc("DELETE /wishlist", middlewares.AuthMiddleware(jwtSecret, wishlistHandler.DeleteItem))

	// Rotas para Swagger UI e OpenAPI
	mux.HandleFunc("GET /docs", handlers.ServeSwaggerUI)
	mux.HandleFunc("GET /docs/openapi.json", handlers.ServeOpenAPISpec)

	// Rota para WebSocket com gorilla/websocket
	mux.HandleFunc("GET /ws", wsHandler.ServeHTTP)

	// Proxy para avatares do Google (evita 429)
	avatarProxy := handlers.NewAvatarProxy()
	mux.HandleFunc("GET /avatar", avatarProxy.Handle)

	handlerComCORS := middlewares.CORSMiddleware(mux, frontendURL)

	// Usar o handler com CORS para todas as rotas
	finalHandler := handlerComCORS

	log.Printf("Servidor rodando na porta %s, aceitando requisições de %s", port, frontendURL)

	addr := fmt.Sprintf(":%s", port)
	fmt.Printf("🚀 Servidor rodando na porta %s...\n", addr)

	if err := http.ListenAndServe(":"+port, finalHandler); err != nil {
		log.Fatalf("❌ Erro ao iniciar o servidor: %v", err)
	}
}

// Esta função é apenas para referência (não é usada, apenas para documentação)
func exampleRedocDocumentation() {
	// ReDoc é uma alternativa simples ao Swagger UI
	// Para usar, descomentar a linha em main.go que registra esta rota
	http.HandleFunc("/redoc", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		redocHTML := `
<!DOCTYPE html>
<html>
<head>
  <title>My House API - ReDoc</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <redoc spec-url="/docs/openapi.json"></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
</body>
</html>
`
		w.Write([]byte(redocHTML))
	})
}
