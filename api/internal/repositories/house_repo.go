package repositories

import (
	"database/sql"
	"fmt"
	"math/rand"
	"my-house/internal/models"
	"time"

	"github.com/google/uuid"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

type HouseRepository struct {
	db *sql.DB
}

func NewHouseRepository(db *sql.DB) *HouseRepository {
	return &HouseRepository{db: db}
}

// GenerateInviteCode gera um código de convite único de 6 dígitos
func GenerateInviteCode() string {
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

// GetHouseByUserID retorna a casa associada ao usuário
func (r *HouseRepository) GetHouseByUserID(userID string) (*models.HouseProfile, error) {
	query := `
		SELECT h.id, h.name, u.role, h.created_at
		FROM houses h
		INNER JOIN users u ON h.id = u.house_id
		WHERE u.id = $1
	`

	var house models.HouseProfile
	err := r.db.QueryRow(query, userID).Scan(&house.ID, &house.Name, &house.Role, &house.JoinedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	// Carregar bills da casa
	house.Bills = make([]models.BillProfile, 0)
	billQuery := `SELECT id, name, total_amount, due_date, status FROM bills WHERE house_id = $1`
	billRows, err := r.db.Query(billQuery, house.ID)
	if err == nil {
		defer billRows.Close()
		for billRows.Next() {
			var bill models.BillProfile
			billRows.Scan(&bill.ID, &bill.Title, &bill.Amount, &bill.DueDate, &bill.Status)
			house.Bills = append(house.Bills, bill)
		}
	}

	// Contar moradores
	r.db.QueryRow(`SELECT COUNT(*) FROM users WHERE house_id = $1`, house.ID).Scan(&house.ResidentsCount)

	return &house, nil
}

// CreateHouse cria uma nova casa e vincula ao usuário, gerando um código de convite
func (r *HouseRepository) CreateHouse(userID string, name string) (*models.HouseProfile, error) {
	// Verificar se o usuário já tem uma casa
	var existingHouseID sql.NullString
	err := r.db.QueryRow(`SELECT house_id FROM users WHERE id = $1`, userID).Scan(&existingHouseID)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	if existingHouseID.Valid {
		// Usuário já possui uma casa, retornar erro
		return nil, ErrUserAlreadyHasHouse
	}

	houseID := uuid.New().String()
	now := time.Now()
	inviteCode := GenerateInviteCode()
	inviteExpiration := now.Add(24 * time.Hour)

	query := `INSERT INTO houses (id, name, invite_code, invite_code_expires_at, created_at) VALUES ($1, $2, $3, $4, $5)`
	_, err = r.db.Exec(query, houseID, name, inviteCode, inviteExpiration, now)
	if err != nil {
		return nil, err
	}

	// Atualizar o user para apontar para a nova casa e mudar role para "owner"
	updateQuery := `UPDATE users SET house_id = $1, role = 'owner' WHERE id = $2`
	_, err = r.db.Exec(updateQuery, houseID, userID)
	if err != nil {
		return nil, err
	}

	return &models.HouseProfile{
		ID:         houseID,
		Name:       name,
		Role:       "owner",
		JoinedAt:   now,
		Bills:      make([]models.BillProfile, 0),
		InviteCode: &inviteCode,
	}, nil
}

// UpdateHouseByUserID atualiza a casa do usuário
func (r *HouseRepository) UpdateHouseByUserID(userID string, name string) (*models.HouseProfile, error) {
	// Buscar a casa do usuário
	var houseID string
	var role string
	var joinedAt time.Time

	query := `
		SELECT h.id, u.role, h.created_at
		FROM houses h
		INNER JOIN users u ON h.id = u.house_id
		WHERE u.id = $1
	`
	err := r.db.QueryRow(query, userID).Scan(&houseID, &role, &joinedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	// Atualizar a casa
	updateQuery := `UPDATE houses SET name = $1 WHERE id = $2`
	_, err = r.db.Exec(updateQuery, name, houseID)
	if err != nil {
		return nil, err
	}

	return r.GetHouseByUserID(userID)
}

// DeleteHouseByUserID remove a vinculação da casa do usuário
func (r *HouseRepository) DeleteHouseByUserID(userID string) error {
	// Apenas desvincula, não deleta a casa
	query := `UPDATE users SET house_id = NULL, role = NULL WHERE id = $1`
	_, err := r.db.Exec(query, userID)
	return err
}

// RemoveUserFromHouse remove a vinculação do usuário de uma casa (sair da casa)
func (r *HouseRepository) RemoveUserFromHouse(userID string) error {
	// Apenas desvincula, não deleta a casa
	query := `UPDATE users SET house_id = NULL, role = NULL WHERE id = $1`
	_, err := r.db.Exec(query, userID)
	return err
}

// DeleteHouseCompletely deleta a casa e remove TODOS os usuários dela
func (r *HouseRepository) DeleteHouseCompletely(houseID string) error {
	// 1. Remover TODOS os usuários da casa
	query1 := `UPDATE users SET house_id = NULL, role = NULL WHERE house_id = $1`
	_, err := r.db.Exec(query1, houseID)
	if err != nil {
		return err
	}

	// 2. Deletar a casa do banco
	query2 := `DELETE FROM houses WHERE id = $1`
	_, err = r.db.Exec(query2, houseID)
	return err
}

// RegenerateInviteCode gera um novo código de convite com validade de 1 dia
func (r *HouseRepository) RegenerateInviteCode(houseID string) (string, error) {
	inviteCode := GenerateInviteCode()
	inviteExpiration := time.Now().Add(24 * time.Hour)

	query := `UPDATE houses SET invite_code = $1, invite_code_expires_at = $2 WHERE id = $3`
	_, err := r.db.Exec(query, inviteCode, inviteExpiration, houseID)
	if err != nil {
		return "", err
	}

	return inviteCode, nil
}

// GetHouseIDByUserID retorna apenas o ID da casa do usuário
func (r *HouseRepository) GetHouseIDByUserID(userID string) (string, error) {
	query := `SELECT h.id FROM houses h INNER JOIN users u ON h.id = u.house_id WHERE u.id = $1`

	var houseID string
	err := r.db.QueryRow(query, userID).Scan(&houseID)

	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}

	return houseID, nil
}

// GetInviteCode retorna o código de convite da casa se estiver válido
func (r *HouseRepository) GetInviteCode(houseID string) (string, error) {
	query := `SELECT invite_code FROM houses WHERE id = $1 AND invite_code_expires_at > NOW()`

	var inviteCode string
	err := r.db.QueryRow(query, houseID).Scan(&inviteCode)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil // Código expirado ou não existe
		}
		return "", err
	}

	return inviteCode, nil
}

// JoinHouseWithInviteCode permite que um usuário entre numa casa usando um código de convite válido
func (r *HouseRepository) JoinHouseWithInviteCode(userID string, inviteCode string) (*models.HouseProfile, error) {
	// Verificar se o usuário já tem uma casa
	var existingHouseID sql.NullString
	err := r.db.QueryRow(`SELECT house_id FROM users WHERE id = $1`, userID).Scan(&existingHouseID)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	if existingHouseID.Valid {
		// Usuário já possui uma casa
		return nil, fmt.Errorf("utilizador já possui uma casa")
	}

	// Buscar a casa pelo código de convite (e verificar validade)
	query := `
		SELECT h.id, h.name, h.created_at
		FROM houses h
		WHERE h.invite_code = $1 AND h.invite_code_expires_at > NOW()
	`

	var houseID, houseName string
	var createdAt time.Time

	err = r.db.QueryRow(query, inviteCode).Scan(&houseID, &houseName, &createdAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("código de convite inválido ou expirado")
		}
		return nil, err
	}

	// Atualizar o usuário para apontar para a casa com role "resident"
	updateQuery := `UPDATE users SET house_id = $1, role = 'resident' WHERE id = $2`
	_, err = r.db.Exec(updateQuery, houseID, userID)
	if err != nil {
		return nil, err
	}

	// Retornar os dados da casa
	return &models.HouseProfile{
		ID:       houseID,
		Name:     houseName,
		Role:     "resident",
		JoinedAt: time.Now(),
		Bills:    make([]models.BillProfile, 0),
	}, nil
}
