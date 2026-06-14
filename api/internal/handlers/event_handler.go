package handlers

import (
	"encoding/json"
	"my-house/internal/services"
	"net/http"
	"time"
)

type EventHandler struct {
	eventService        *services.EventService
	houseService        *services.HouseService
	notificationService *services.NotificationService
	userService         *services.UserService
}

func NewEventHandler(eventService *services.EventService, houseService *services.HouseService, notificationService *services.NotificationService, userService *services.UserService) *EventHandler {
	return &EventHandler{
		eventService:        eventService,
		houseService:        houseService,
		notificationService: notificationService,
		userService:         userService,
	}
}

func (h *EventHandler) GetEvents(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	house, err := h.houseService.GetUserHouse(userID)
	if err != nil || house == nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}
	events, err := h.eventService.GetEvents(house.ID)
	if err != nil {
		http.Error(w, "Erro ao buscar eventos", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	house, err := h.houseService.GetUserHouse(userID)
	if err != nil || house == nil {
		http.Error(w, "Usuário não possui casa", http.StatusBadRequest)
		return
	}

	var req struct {
		Name          string   `json:"name"`
		Description   string   `json:"description"`
		EventDate     string   `json:"event_date"`
		Periodicity   string   `json:"periodicity"`
		Address       string   `json:"address"`
		ParticipantIDs []string `json:"participant_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	eventDate, err := time.Parse(time.RFC3339, req.EventDate)
	if err != nil {
		eventDate, err = time.Parse("2006-01-02T15:04", req.EventDate)
		if err != nil {
			http.Error(w, "Data inválida", http.StatusBadRequest)
			return
		}
	}

	event, err := h.eventService.CreateEvent(house.ID, userID, req.Name, req.Description, req.Periodicity, req.Address, eventDate, req.ParticipantIDs)
	if err != nil {
		http.Error(w, "Erro ao criar evento", http.StatusInternalServerError)
		return
	}

	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(house.ID, userID, "📅 Novo evento", userName+" criou o evento \""+event.Name+"\".")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(event)
}

func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		ID             string   `json:"id"`
		Name           string   `json:"name"`
		Description    string   `json:"description"`
		EventDate      string   `json:"event_date"`
		Periodicity    string   `json:"periodicity"`
		Address        string   `json:"address"`
		ParticipantIDs []string `json:"participant_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	eventDate, _ := time.Parse(time.RFC3339, req.EventDate)
	if eventDate.IsZero() {
		eventDate, _ = time.Parse("2006-01-02T15:04", req.EventDate)
	}

	event, err := h.eventService.UpdateEvent(req.ID, userID, req.Name, req.Description, req.Periodicity, req.Address, eventDate, req.ParticipantIDs)
	if err != nil {
		http.Error(w, "Erro ao atualizar evento", http.StatusInternalServerError)
		return
	}

	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(event.HouseID, userID, "📅 Evento atualizado", userName+" atualizou o evento \""+event.Name+"\".")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	event, err := h.eventService.GetEvent(req.ID)
	if err == nil {
		userName, _ := h.userService.GetUserName(userID)
		h.notificationService.CreateAndNotify(event.HouseID, userID, "🗑️ Evento removido", userName+" removeu o evento \""+event.Name+"\".")
	}

	if err := h.eventService.DeleteEvent(req.ID, userID); err != nil {
		http.Error(w, "Erro ao deletar evento", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *EventHandler) ConfirmPresence(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	if err := h.eventService.ConfirmPresence(req.ID, userID); err != nil {
		http.Error(w, "Erro ao confirmar presença", http.StatusInternalServerError)
		return
	}

	event, _ := h.eventService.GetEvent(req.ID)
	if event != nil {
		userName, _ := h.userService.GetUserName(userID)
		h.notificationService.CreateAndNotify(event.HouseID, userID, "✅ Presença confirmada", userName+" confirmou presença no evento \""+event.Name+"\".")
	}

	w.WriteHeader(http.StatusNoContent)
}
