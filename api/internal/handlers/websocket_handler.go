package handlers

import (
	"log"
	"my-house/internal/services"
	"net/http"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	wsService *services.WebSocketService
	upgrader  websocket.Upgrader
}

func NewWebSocketHandler(wsService *services.WebSocketService) *WebSocketHandler {
	return &WebSocketHandler{
		wsService: wsService,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				// Aceitar conexões de qualquer origem (você pode ser mais restritivo em produção)
				return true
			},
		},
	}
}

func (h *WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔌 WebSocket request: %s %s", r.Method, r.URL.String())
	log.Printf("📍 Origin: %s", r.Header.Get("Origin"))

	// Fazer upgrade da conexão HTTP para WebSocket
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("❌ Erro ao fazer upgrade para WebSocket: %v", err)
		http.Error(w, "Erro ao fazer upgrade para WebSocket", http.StatusBadRequest)
		return
	}
	defer conn.Close()

	// Criar novo cliente
	clientID := uuid.New().String()
	client := &services.Client{
		ID:   clientID,
		Conn: conn,
		Send: make(chan services.Message, 256),
	}

	log.Printf("✨ Cliente conectado: %s", clientID)

	// Registrar cliente
	h.wsService.RegisterClient(client)

	// Executar leitura e escrita em paralelo
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		h.wsService.ReadMessages(client)
	}()

	go func() {
		defer wg.Done()
		h.wsService.WriteMessages(client)
	}()

	wg.Wait()
}
