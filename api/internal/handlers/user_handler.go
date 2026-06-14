package handlers

import (
	"encoding/json"
	"log"
	"my-house/internal/services"
	"net/http"
)

type UserHandler struct {
	userService         *services.UserService
	houseService        *services.HouseService
	notificationService *services.NotificationService
}

func NewUserHandler(userService *services.UserService, houseService *services.HouseService, notificationService *services.NotificationService) *UserHandler {
	return &UserHandler{
		userService:         userService,
		houseService:        houseService,
		notificationService: notificationService,
	}
}

func (h *UserHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	log.Printf("Getting profile for user: %s", userID)

	profile, err := h.userService.GetProfile(userID)
	if err != nil {
		log.Printf("❌ Error getting profile: %v", err)
		http.Error(w, "Erro ao buscar perfil do utilizador", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func (h *UserHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		PixKey string `json:"pix_key"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	if req.PixKey == "" {
		http.Error(w, "Chave PIX é obrigatória", http.StatusBadRequest)
		return
	}

	user, err := h.userService.UpdatePixKey(userID, req.PixKey)
	if err != nil {
		log.Printf("❌ Error updating pix key: %v", err)
		http.Error(w, "Erro ao atualizar chave PIX", http.StatusInternalServerError)
		return
	}

	house, _ := h.houseService.GetUserHouse(userID)
	if house != nil {
		h.notificationService.CreateAndNotify(house.ID, userID, "🔑 Chave PIX atualizada", user.Name+" atualizou a chave PIX.")
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	users, err := h.userService.GetHouseResidents(userID)
	if err != nil {
		http.Error(w, "Erro ao listar usuários", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	if err := h.userService.DeleteUser(userID); err != nil {
		log.Printf("❌ Error deleting user: %v", err)
		http.Error(w, "Erro ao deletar usuário", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
