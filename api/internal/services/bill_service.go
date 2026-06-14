package services

import (
	"my-house/internal/models"
	"my-house/internal/repositories"
	"time"
)

type BillService struct {
	repo      *repositories.BillRepository
	wsService *WebSocketService
}

func NewBillService(repo *repositories.BillRepository, wsService *WebSocketService) *BillService {
	return &BillService{repo: repo, wsService: wsService}
}

func (s *BillService) GetBills(houseID string) ([]models.Bill, error) {
	bills, err := s.repo.GetBillsByHouseID(houseID)
	if err != nil {
		return nil, err
	}
	if bills == nil {
		bills = []models.Bill{}
	}
	return bills, nil
}

func (s *BillService) CreateBill(houseID, ownerID, name, billType string, totalAmount float64, dueDate time.Time, residentIDs []string) (*models.Bill, error) {
	bill, err := s.repo.CreateBill(houseID, ownerID, name, billType, totalAmount, dueDate, residentIDs)
	if err != nil {
		return nil, err
	}

	s.wsService.BroadcastToHouse(houseID, "bill-created", bill)
	return bill, nil
}

func (s *BillService) UpdateBill(billID, userID, name, billType string, totalAmount float64, dueDate time.Time, status string, residentIDs []string) (*models.Bill, error) {
	bill, err := s.repo.UpdateBill(billID, userID, name, billType, totalAmount, dueDate, status, residentIDs)
	if err != nil {
		return nil, err
	}

	s.wsService.BroadcastToHouse(bill.HouseID, "bill-updated", bill)
	return bill, nil
}

func (s *BillService) DeleteBill(billID, userID string) (*models.Bill, error) {
	if s.repo.HasPayments(billID) {
		return nil, repositories.ErrBillHasPayments
	}

	bill, err := s.repo.GetBillByID(billID)
	if err != nil {
		return nil, err
	}

	if err := s.repo.DeleteBill(billID, userID); err != nil {
		return nil, err
	}

	s.wsService.BroadcastToHouse(bill.HouseID, "bill-deleted", map[string]string{"billID": billID})
	return bill, nil
}

func (s *BillService) PayBill(billID, userID string) (*models.Bill, error) {
	bill, err := s.repo.PayBill(billID, userID)
	if err != nil {
		return nil, err
	}

	s.wsService.BroadcastToHouse(bill.HouseID, "bill-updated", bill)
	return bill, nil
}
