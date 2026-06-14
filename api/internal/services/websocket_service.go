package services

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Message define a estrutura de mensagem enviada via WebSocket
type Message struct {
	Event   string      `json:"event"`
	HouseID string      `json:"houseID,omitempty"`
	UserID  string      `json:"userID,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// Client representa uma conexão WebSocket ativa
type Client struct {
	ID       string
	HouseID  string
	Conn     *websocket.Conn
	Send     chan Message
	UserID   string
	closeOnce sync.Once
}

type WebSocketService struct {
	clients      map[string]*Client        // map[socketID]Client
	houses       map[string]map[string]*Client // map[houseID]map[socketID]Client
	register     chan *Client
	unregister   chan *Client
	broadcast    chan Message
	mu           sync.RWMutex
	userSessions map[string]string // userID -> houseID (para referência rápida)
}

func NewWebSocketService() (*WebSocketService, error) {	
	ws := &WebSocketService{
		clients:      make(map[string]*Client),
		houses:       make(map[string]map[string]*Client),
		register:     make(chan *Client, 256),
		unregister:   make(chan *Client, 256),
		broadcast:    make(chan Message, 256),
		userSessions: make(map[string]string),
	}

	go ws.run()

	return ws, nil
}

// run é o loop principal que gerencia conexões e mensagens
func (ws *WebSocketService) run() {
	for {
		select {
		case client := <-ws.register:
			ws.mu.Lock()
			ws.clients[client.ID] = client
			ws.mu.Unlock()

		case client := <-ws.unregister:
			ws.mu.Lock()
			if _, exists := ws.clients[client.ID]; exists {
				delete(ws.clients, client.ID)

				if houseID, ok := ws.userSessions[client.UserID]; ok {
					if room, exists := ws.houses[houseID]; exists {
						delete(room, client.ID)
						if len(room) == 0 {
							delete(ws.houses, houseID)
						}
					}
					delete(ws.userSessions, client.UserID)
				}

				close(client.Send)
			}
			ws.mu.Unlock()

		case msg := <-ws.broadcast:
			ws.mu.RLock()
			if houseClients, exists := ws.houses[msg.HouseID]; exists {
				for _, client := range houseClients {
					select {
					case client.Send <- msg:
					default:
					}
				}
			}
			ws.mu.RUnlock()
		}
	}
}

// RegisterClient adiciona um novo cliente
func (ws *WebSocketService) RegisterClient(client *Client) {
	ws.register <- client
}

// UnregisterClient remove um cliente
func (ws *WebSocketService) UnregisterClient(client *Client) {
	ws.unregister <- client
}

// JoinHouse adiciona um cliente a uma sala de casa
func (ws *WebSocketService) JoinHouse(client *Client, houseID string, userID string) {
	ws.mu.Lock()
	defer ws.mu.Unlock()

	client.HouseID = houseID
	client.UserID = userID

	if _, exists := ws.houses[houseID]; !exists {
		ws.houses[houseID] = make(map[string]*Client)
	}

	ws.houses[houseID][client.ID] = client
	ws.userSessions[userID] = houseID

	select {
	case client.Send <- Message{
		Event:   "joined",
		HouseID: houseID,
		Data: map[string]string{
			"message": "Você entrou na sala da casa",
			"houseID": houseID,
		},
	}:
	default:
	}
}

// BroadcastToHouse envia uma mensagem para todos os clientes em uma casa
func (ws *WebSocketService) BroadcastToHouse(houseID string, event string, data interface{}) {
	msg := Message{
		Event:   event,
		HouseID: houseID,
		Data:    data,
	}

	ws.broadcast <- msg
}

// NotifyHouseUpdated notifica quando uma casa é atualizada
func (ws *WebSocketService) NotifyHouseUpdated(houseID string, houseName string) {
	ws.BroadcastToHouse(houseID, "house-updated", map[string]string{
		"houseID": houseID,
		"name":    houseName,
	})
}

// NotifyHouseDeleted notifica quando uma casa é deletada
func (ws *WebSocketService) NotifyHouseDeleted(houseID string) {
	ws.BroadcastToHouse(houseID, "house-deleted", map[string]string{
		"houseID": houseID,
	})
}

// NotifyInviteCodeRegenerated notifica quando um código de convite é regenerado
func (ws *WebSocketService) NotifyInviteCodeRegenerated(houseID string, newCode string) {
	ws.BroadcastToHouse(houseID, "invite-code-regenerated", map[string]string{
		"houseID":    houseID,
		"inviteCode": newCode,
	})
}

// ReadMessages lê mensagens de um cliente WebSocket
func (ws *WebSocketService) ReadMessages(client *Client) {
	defer ws.UnregisterClient(client)

	for {
		var msg Message
		err := client.Conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("❌ Erro WebSocket para %s: %v", client.ID, err)
			}
			break
		}

		log.Printf("📨 Mensagem recebida de %s: evento=%s", client.ID, msg.Event)

		// Processar eventos
		switch msg.Event {
		case "join-house":
			// Esperado: msg.HouseID e msg.UserID já estão preenchidos
			ws.JoinHouse(client, msg.HouseID, msg.UserID)
		default:
			log.Printf("⚠️ Evento desconhecido: %s", msg.Event)
		}
	}
}

// WriteMessages escreve mensagens para um cliente WebSocket
func (ws *WebSocketService) WriteMessages(client *Client) {
	ticker := time.NewTicker(time.Second * 54) // Ping a cada 54 segundos
	defer func() {
		ticker.Stop()
		client.Conn.Close()
	}()

	for {
		select {
		case msg, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				// Channel fechado
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := client.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}

			if err := json.NewEncoder(w).Encode(msg); err != nil {
				w.Close()
				return
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
