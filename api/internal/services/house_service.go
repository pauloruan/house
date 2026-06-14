package services

import (
	"errors"
	"my-house/internal/models"
	"my-house/internal/repositories"
)

type HouseService struct {
	houseRepo *repositories.HouseRepository
	userRepo  *repositories.UserRepository
}

func NewHouseService(repo *repositories.HouseRepository, userRepo *repositories.UserRepository) *HouseService {
	return &HouseService{
		houseRepo: repo,
		userRepo:  userRepo,
	}
}

func (s *HouseService) GetUserHouse(userID string) (*models.HouseProfile, error) {
	return s.houseRepo.GetHouseByUserID(userID)
}

func (s *HouseService) CreateHouse(userID string, name string) (*models.HouseProfile, error) {
	return s.houseRepo.CreateHouse(userID, name)
}

func (s *HouseService) UpdateHouse(userID string, name string) (*models.HouseProfile, error) {
	// Verificar se o usuário é owner
	role, err := s.userRepo.GetUserRole(userID)
	if err != nil {
		return nil, err
	}
	
	if role != "owner" {
		return nil, errors.New("apenas o proprietário da casa pode editar")
	}
	
	return s.houseRepo.UpdateHouseByUserID(userID, name)
}

func (s *HouseService) DeleteHouse(userID string) error {
	// Verificar se o usuário é owner
	role, err := s.userRepo.GetUserRole(userID)
	if err != nil {
		return err
	}
	
	if role != "owner" {
		return errors.New("apenas o proprietário da casa pode deletar")
	}
	
	// Buscar o ID da casa do usuário
	houseID, err := s.houseRepo.GetHouseIDByUserID(userID)
	if err != nil {
		return err
	}
	
	if houseID == "" {
		return errors.New("utilizador não possui uma casa")
	}
	
	// Deletar a casa completamente (remove todos os usuários e deleta a casa)
	return s.houseRepo.DeleteHouseCompletely(houseID)
}

func (s *HouseService) RegenerateInviteCode(userID string) (string, error) {
	// Verificar se o usuário é owner
	role, err := s.userRepo.GetUserRole(userID)
	if err != nil {
		return "", err
	}
	
	if role != "owner" {
		return "", errors.New("apenas o proprietário da casa pode regenerar código de convite")
	}
	
	// Buscar a casa do usuário
	houseID, err := s.houseRepo.GetHouseIDByUserID(userID)
	if err != nil {
		return "", err
	}

	if houseID == "" {
		return "", nil // Usuário não tem casa
	}

	// Regenerar código
	return s.houseRepo.RegenerateInviteCode(houseID)
}

func (s *HouseService) JoinHouseWithInviteCode(userID string, inviteCode string) (*models.HouseProfile, error) {
	return s.houseRepo.JoinHouseWithInviteCode(userID, inviteCode)
}

func (s *HouseService) LeaveHouse(userID string) error {
	return s.houseRepo.RemoveUserFromHouse(userID)
}
