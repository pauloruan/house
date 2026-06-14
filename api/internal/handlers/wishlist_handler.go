package handlers

import (
	"encoding/json"
	"my-house/internal/services"
	"net/http"
)

type WishlistHandler struct {
	wishlistService    *services.WishlistService
	houseService       *services.HouseService
	notificationService *services.NotificationService
	userService        *services.UserService
}

func NewWishlistHandler(wishlistService *services.WishlistService, houseService *services.HouseService, notificationService *services.NotificationService, userService *services.UserService) *WishlistHandler {
	return &WishlistHandler{
		wishlistService:    wishlistService,
		houseService:       houseService,
		notificationService: notificationService,
		userService:        userService,
	}
}

func (h *WishlistHandler) GetItems(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	house, err := h.houseService.GetUserHouse(userID)
	if err != nil || house == nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}

	items, err := h.wishlistService.GetItems(house.ID)
	if err != nil {
		http.Error(w, "Erro ao buscar itens", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (h *WishlistHandler) AddItem(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	house, err := h.houseService.GetUserHouse(userID)
	if err != nil || house == nil {
		http.Error(w, "Usuário não possui casa", http.StatusBadRequest)
		return
	}

	var req struct {
		URL string `json:"url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	if req.URL == "" {
		http.Error(w, "URL é obrigatória", http.StatusBadRequest)
		return
	}

	item, err := h.wishlistService.AddItem(house.ID, userID, req.URL)
	if err != nil {
		http.Error(w, "Erro ao adicionar item", http.StatusInternalServerError)
		return
	}

	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(house.ID, userID, "🎁 Novo desejo", userName+" adicionou \""+item.Title+"\" à lista de desejos.")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

func (h *WishlistHandler) DeleteItem(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	if err := h.wishlistService.DeleteItem(req.ID, userID); err != nil {
		http.Error(w, "Erro ao deletar item", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
