package services

import (
	"log"
	"my-house/internal/models"
	"my-house/internal/repositories"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type GoogleUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

type AuthService struct {
	userRepo  *repositories.UserRepository
	jwtSecret string
}

func NewAuthService(repo *repositories.UserRepository, secret string) *AuthService {
	return &AuthService{
		userRepo:  repo,
		jwtSecret: secret,
	}
}

func (s *AuthService) ProcessGoogleLogin(userInfo GoogleUser) (string, error) {
	log.Printf("Processando login para o usuário: %s (%s)", userInfo.Name, userInfo.Email)
	user, err := s.userRepo.FindByGoogleID(userInfo.ID)
	if err != nil {
		log.Printf("❌ Erro ao buscar usuário por GoogleID: %v", err)
		return "", err
	}

	if user == nil {
		log.Printf("👤 Novo usuário detectado, criando: %s", userInfo.Email)
		residentRole := "resident"
		user = &models.User{
			ID:             uuid.New().String(),
			GoogleID:       userInfo.ID,
			Name:           userInfo.Name,
			Email:          userInfo.Email,
			ProfilePicture: userInfo.Picture,
			Role:           &residentRole,
			CreatedAt:      time.Now(),
		}
		if err := s.userRepo.Create(user); err != nil {
			log.Printf("❌ Erro ao criar usuário no banco: %v", err)
			return "", err
		}
		log.Printf("✅ Novo usuário criado no banco: %s", user.ID)
	} else {
		log.Printf("👤 Usuário existente encontrado: %s", user.ID)
	}

	log.Printf("🔑 Gerando JWT token para: %s", user.ID)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		log.Printf("❌ Erro ao assinar JWT: %v", err)
		return "", err
	}

	log.Printf("✅ Login processado com sucesso para: %s", user.Email)
	return tokenString, nil
}
