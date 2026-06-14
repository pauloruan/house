package services

import (
	"my-house/internal/models"
	"my-house/internal/repositories"
)

type UserService struct {
	userRepo *repositories.UserRepository
}

func NewUserService(repo *repositories.UserRepository) *UserService {
	return &UserService{userRepo: repo}
}

func (s *UserService) GetProfile(userID string) (*models.MeResponse, error) {
	return s.userRepo.GetFullProfile(userID)
}

func (s *UserService) UpdatePixKey(userID string, pixKey string) (*models.UserProfile, error) {
	if err := s.userRepo.UpdatePixKey(userID, pixKey); err != nil {
		return nil, err
	}

	profile, err := s.userRepo.GetFullProfile(userID)
	if err != nil {
		return nil, err
	}

	return &profile.User, nil
}

func (s *UserService) GetUserName(userID string) (string, error) {
	return s.userRepo.GetUserName(userID)
}

func (s *UserService) GetHouseResidents(userID string) ([]models.UserProfile, error) {
	profile, err := s.userRepo.GetFullProfile(userID)
	if err != nil {
		return nil, err
	}
	if profile.User.House == nil {
		return []models.UserProfile{}, nil
	}

	return profile.User.House.Residents, nil
}

func (s *UserService) DeleteUser(userID string) error {
	return s.userRepo.DeleteUser(userID)
}
