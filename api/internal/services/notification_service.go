package services

import (
	"log"
	"my-house/internal/models"
	"my-house/internal/repositories"
)

type NotificationService struct {
	repo      *repositories.NotificationRepository
	wsService *WebSocketService
}

func NewNotificationService(repo *repositories.NotificationRepository, wsService *WebSocketService) *NotificationService {
	return &NotificationService{repo: repo, wsService: wsService}
}

func (s *NotificationService) CreateAndNotify(houseID, creatorID, title, text string) (*models.Notification, error) {
	notification, err := s.repo.CreateNotification(houseID, creatorID, title, text)
	if err != nil {
		log.Printf("❌ Erro ao criar notificação: %v", err)
		return nil, err
	}

	// Enviar via WebSocket para todos da casa
	s.wsService.BroadcastToHouse(houseID, "new-notification", notification)

	return notification, nil
}

func (s *NotificationService) GetNotifications(houseID string) ([]models.Notification, error) {
	notifications, err := s.repo.GetNotificationsByHouseID(houseID)
	if err != nil {
		return nil, err
	}

	if notifications == nil {
		notifications = []models.Notification{}
	}

	return notifications, nil
}
