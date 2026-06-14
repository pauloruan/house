package handlers

import (
	"encoding/json"
	"my-house/internal/services"
	"net/http"
	"time"
)

type BillHandler struct {
	billService         *services.BillService
	houseService        *services.HouseService
	notificationService *services.NotificationService
	userService         *services.UserService
}

func NewBillHandler(billService *services.BillService, houseService *services.HouseService, notificationService *services.NotificationService, userService *services.UserService) *BillHandler {
	return &BillHandler{
		billService:         billService,
		houseService:        houseService,
		notificationService: notificationService,
		userService:         userService,
	}
}

func (h *BillHandler) GetBills(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	house, err := h.houseService.GetUserHouse(userID)
	if err != nil || house == nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}

	bills, err := h.billService.GetBills(house.ID)
	if err != nil {
		http.Error(w, "Erro ao buscar contas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bills)
}

func (h *BillHandler) CreateBill(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	house, err := h.houseService.GetUserHouse(userID)
	if err != nil || house == nil {
		http.Error(w, "Utilizador não possui uma casa", http.StatusBadRequest)
		return
	}

	var req struct {
		Name        string   `json:"name"`
		Type        string   `json:"type"`
		TotalAmount float64  `json:"total_amount"`
		DueDate     string   `json:"due_date"`
		ResidentIDs []string `json:"resident_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	dueDate, err := time.Parse("2006-01-02", req.DueDate)
	if err != nil {
		http.Error(w, "Data inválida", http.StatusBadRequest)
		return
	}

	bill, err := h.billService.CreateBill(house.ID, userID, req.Name, req.Type, req.TotalAmount, dueDate, req.ResidentIDs)
	if err != nil {
		http.Error(w, "Erro ao criar conta", http.StatusInternalServerError)
		return
	}

	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(house.ID, userID, "💰 Nova conta", userName+" adicionou a conta \""+bill.Name+"\".")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(bill)
}

func (h *BillHandler) UpdateBill(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		ID          string   `json:"id"`
		Name        string   `json:"name"`
		Type        string   `json:"type"`
		TotalAmount float64  `json:"total_amount"`
		DueDate     string   `json:"due_date"`
		Status      string   `json:"status"`
		ResidentIDs []string `json:"resident_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	dueDate, err := time.Parse("2006-01-02", req.DueDate)
	if err != nil {
		http.Error(w, "Data inválida", http.StatusBadRequest)
		return
	}

	bill, err := h.billService.UpdateBill(req.ID, userID, req.Name, req.Type, req.TotalAmount, dueDate, req.Status, req.ResidentIDs)
	if err != nil {
		http.Error(w, "Erro ao atualizar conta", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bill)
}

func (h *BillHandler) DeleteBill(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	bill, err := h.billService.DeleteBill(req.ID, userID)
	if err != nil {
		if err.Error() == "conta possui pagamentos e não pode ser deletada" {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		http.Error(w, "Erro ao deletar conta", http.StatusInternalServerError)
		return
	}

	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(bill.HouseID, userID, "🗑️ Conta removida", userName+" removeu a conta \""+bill.Name+"\".")

	w.WriteHeader(http.StatusNoContent)
}

func (h *BillHandler) PayBill(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	bill, err := h.billService.PayBill(req.ID, userID)
	if err != nil {
		http.Error(w, "Erro ao marcar pagamento", http.StatusInternalServerError)
		return
	}

	userName, _ := h.userService.GetUserName(userID)
	h.notificationService.CreateAndNotify(bill.HouseID, userID, "✅ Pagamento", userName+" marcou pagamento de \""+bill.Name+"\".")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bill)
}
