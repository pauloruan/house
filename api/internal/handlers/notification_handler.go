package handlers

import (
	"encoding/json"
	"my-house/internal/services"
	"net/http"
)

type NotificationHandler struct {
	notificationService *services.NotificationService
	houseService        *services.HouseService
}

func NewNotificationHandler(notificationService *services.NotificationService, houseService *services.HouseService) *NotificationHandler {
	return &NotificationHandler{
		notificationService: notificationService,
		houseService:        houseService,
	}
}

func (h *NotificationHandler) GetNotifications(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	house, err := h.houseService.GetUserHouse(userID)
	if err != nil || house == nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}

	notifications, err := h.notificationService.GetNotifications(house.ID)
	if err != nil {
		http.Error(w, "Erro ao buscar notificações", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}
