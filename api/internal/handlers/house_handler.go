package handlers

import (
	"encoding/json"
	"log"
	"my-house/internal/services"
	"net/http"
)

type HouseHandler struct {
	houseService        *services.HouseService
	wsService           *services.WebSocketService
	notificationService *services.NotificationService
	userService         *services.UserService
}

func NewHouseHandler(service *services.HouseService, wsService *services.WebSocketService, notificationService *services.NotificationService, userService *services.UserService) *HouseHandler {
	return &HouseHandler{
		houseService:        service,
		wsService:           wsService,
		notificationService: notificationService,
		userService:         userService,
	}
}

// GetHouse retorna a casa do usuário autenticado
func (h *HouseHandler) GetHouse(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	house, err := h.houseService.GetUserHouse(userID)
	if err != nil {
		http.Error(w, "Erro ao buscar casa do utilizador", http.StatusInternalServerError)
		return
	}

	if house == nil {
		http.Error(w, "Utilizador não possui uma casa", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(house)
}

// CreateHouse cria uma nova casa para o usuário
func (h *HouseHandler) CreateHouse(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Nome da casa é obrigatório", http.StatusBadRequest)
		return
	}

	house, err := h.houseService.CreateHouse(userID, req.Name)
	if err != nil {
		log.Printf("❌ Erro ao criar casa: %v", err)
		http.Error(w, "Erro ao criar casa", http.StatusInternalServerError)
		return
	}

	log.Printf("✅ Casa criada com sucesso: ID=%s, InviteCode=%v", house.ID, house.InviteCode)

	// Criar notificação
	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(house.ID, userID, "🏠 Casa criada", userName+" criou a casa \""+house.Name+"\".")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(house)
}

// UpdateHouse atualiza a casa do usuário
func (h *HouseHandler) UpdateHouse(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Nome da casa é obrigatório", http.StatusBadRequest)
		return
	}

	house, err := h.houseService.UpdateHouse(userID, req.Name)
	if err != nil {
		log.Printf("❌ Erro ao atualizar casa: %v", err)
		// Verificar se é erro de permissão
		if err.Error() == "apenas o proprietário da casa pode editar" {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		http.Error(w, "Erro ao atualizar casa", http.StatusInternalServerError)
		return
	}

	if house == nil {
		http.Error(w, "Utilizador não possui uma casa", http.StatusNotFound)
		return
	}

	// 🔔 Notificar outros usuários sobre a atualização
	h.wsService.NotifyHouseUpdated(house.ID, house.Name)
	
	// Criar notificação
	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(house.ID, userID, "✏️ Casa atualizada", userName+" alterou o nome da casa para \""+house.Name+"\".")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(house)
}

// DeleteHouse remove a casa do usuário
func (h *HouseHandler) DeleteHouse(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	// Obter a casa antes de deletar para ter o houseID
	userProfile, err := h.houseService.GetUserHouse(userID)
	if err != nil || userProfile == nil {
		http.Error(w, "Utilizador não possui uma casa", http.StatusNotFound)
		return
	}
	houseID := userProfile.ID

	// 🔔 Notificar ANTES de deletar (enquanto os usuários ainda estão nas salas)
	h.wsService.NotifyHouseDeleted(houseID)

	err = h.houseService.DeleteHouse(userID)
	if err != nil {
		log.Printf("❌ Erro ao deletar casa: %v", err)
		// Verificar se é erro de permissão
		if err.Error() == "apenas o proprietário da casa pode deletar" {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		http.Error(w, "Erro ao remover casa", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RegenerateInviteCode gera um novo código de convite para a casa (apenas admin)
func (h *HouseHandler) RegenerateInviteCode(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	newCode, err := h.houseService.RegenerateInviteCode(userID)
	if err != nil {
		log.Printf("❌ Erro ao regenerar código de convite: %v", err)
		// Verificar se é erro de permissão
		if err.Error() == "apenas o proprietário da casa pode regenerar código de convite" {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		http.Error(w, "Erro ao regenerar código de convite", http.StatusInternalServerError)
		return
	}

	if newCode == "" {
		http.Error(w, "Utilizador não possui uma casa", http.StatusNotFound)
		return
	}

	log.Printf("✅ Código de convite regenerado com sucesso: %s", newCode)

	// Obter o houseID para notificar
	userHouse, _ := h.houseService.GetUserHouse(userID)
	if userHouse != nil {
		// 🔔 Notificar outros usuários sobre a regeneração
		h.wsService.NotifyInviteCodeRegenerated(userHouse.ID, newCode)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"invite_code": newCode,
	})
}

// JoinHouseWithInviteCode permite que um usuário entre numa casa usando um código de convite
func (h *HouseHandler) JoinHouseWithInviteCode(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		InviteCode string `json:"invite_code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	if req.InviteCode == "" {
		http.Error(w, "Código de convite é obrigatório", http.StatusBadRequest)
		return
	}

	house, err := h.houseService.JoinHouseWithInviteCode(userID, req.InviteCode)
	if err != nil {
		log.Printf("❌ Erro ao entrar na casa: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if house == nil {
		http.Error(w, "Código de convite inválido ou expirado", http.StatusNotFound)
		return
	}

	log.Printf("✅ Usuário %s entrou na casa com sucesso: ID=%s", userID, house.ID)

	// Notificar a casa sobre novo morador
	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(house.ID, userID, "👋 Novo morador", userName+" entrou na casa.")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(house)
}

// LeaveHouse permite que um usuário saia de uma casa
func (h *HouseHandler) LeaveHouse(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	// Obter a casa antes de sair
	userHouse, err := h.houseService.GetUserHouse(userID)
	if err != nil || userHouse == nil {
		http.Error(w, "Utilizador não possui uma casa", http.StatusNotFound)
		return
	}

	houseID := userHouse.ID

	// Remover o usuário da casa
	err = h.houseService.LeaveHouse(userID)
	if err != nil {
		log.Printf("❌ Erro ao sair da casa: %v", err)
		http.Error(w, "Erro ao sair da casa", http.StatusInternalServerError)
		return
	}

	log.Printf("✅ Usuário %s saiu da casa %s com sucesso", userID, houseID)

	// Notificar a casa sobre saída de morador
	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(houseID, userID, "👋 Morador saiu", userName+" saiu da casa.")

	w.WriteHeader(http.StatusNoContent)
}
