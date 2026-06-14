package services

import (
	"my-house/internal/models"
	"my-house/internal/repositories"
	"time"
)

type EventService struct {
	repo      *repositories.EventRepository
	wsService *WebSocketService
}

func NewEventService(repo *repositories.EventRepository, wsService *WebSocketService) *EventService {
	return &EventService{repo: repo, wsService: wsService}
}

func (s *EventService) GetEvents(houseID string) ([]models.Event, error) {
	events, err := s.repo.GetEventsByHouseID(houseID)
	if err != nil {
		return nil, err
	}
	if events == nil {
		events = []models.Event{}
	}
	return events, nil
}

func (s *EventService) GetEvent(id string) (*models.Event, error) {
	return s.repo.GetEventByID(id)
}

func (s *EventService) CreateEvent(houseID, creatorID, name, description, periodicity, address string, eventDate time.Time, participantIDs []string) (*models.Event, error) {
	event, err := s.repo.CreateEvent(houseID, creatorID, name, description, periodicity, address, eventDate, participantIDs)
	if err != nil {
		return nil, err
	}
	s.wsService.BroadcastToHouse(houseID, "event-created", event)
	return event, nil
}

func (s *EventService) UpdateEvent(eventID, userID, name, description, periodicity, address string, eventDate time.Time, participantIDs []string) (*models.Event, error) {
	event, err := s.repo.UpdateEvent(eventID, userID, name, description, periodicity, address, eventDate, participantIDs)
	if err != nil {
		return nil, err
	}
	s.wsService.BroadcastToHouse(event.HouseID, "event-updated", event)
	return event, nil
}

func (s *EventService) DeleteEvent(eventID, userID string) error {
	event, err := s.repo.GetEventByID(eventID)
	if err != nil {
		return err
	}
	if err := s.repo.DeleteEvent(eventID, userID); err != nil {
		return err
	}
	s.wsService.BroadcastToHouse(event.HouseID, "event-deleted", map[string]string{"eventID": eventID})
	return nil
}

func (s *EventService) ConfirmPresence(eventID, userID string) error {
	return s.repo.ConfirmPresence(eventID, userID)
}
