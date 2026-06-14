package repositories

import (
	"database/sql"
	"my-house/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByGoogleID(googleID string) (*models.User, error) {
	query := `SELECT id, name, email, profile_picture, google_id, role, created_at FROM users WHERE google_id = $1`

	var user models.User
	err := r.db.QueryRow(query, googleID).Scan(
		&user.ID, &user.Name, &user.Email, &user.ProfilePicture, &user.GoogleID, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) Create(user *models.User) error {
	query := `INSERT INTO users (id, name, email, profile_picture, google_id, role, created_at) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := r.db.Exec(query,
		user.ID, user.Name, user.Email, user.ProfilePicture, user.GoogleID, user.Role, user.CreatedAt,
	)

	return err
}

func (r *UserRepository) GetFullProfile(userID string) (*models.MeResponse, error) {
	userQuery := `SELECT id, name, email, profile_picture, pix_key, house_id, role, created_at FROM users WHERE id = $1`

	var user models.UserProfile
	var houseID sql.NullString
	var role sql.NullString

	err := r.db.QueryRow(userQuery, userID).Scan(
		&user.ID, &user.Name, &user.Email, &user.ProfilePicture, &user.PixKey, &houseID, &role, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if houseID.Valid {
		user.House = &models.HouseProfile{}
		user.House.Role = role.String

		houseQuery := `SELECT id, name, invite_code, created_at FROM houses WHERE id = $1`
		if err := r.db.QueryRow(houseQuery, houseID.String).Scan(&user.House.ID, &user.House.Name, &user.House.InviteCode, &user.House.JoinedAt); err == nil {
			user.House.Bills = make([]models.BillProfile, 0)

			billRows, _ := r.db.Query(`SELECT id, name, total_amount, due_date, status FROM bills WHERE house_id = $1`, user.House.ID)
			for billRows.Next() {
				var bill models.BillProfile
				billRows.Scan(&bill.ID, &bill.Title, &bill.Amount, &bill.DueDate, &bill.Status)
				user.House.Bills = append(user.House.Bills, bill)
			}
			billRows.Close()

			r.db.QueryRow(`SELECT COUNT(*) FROM users WHERE house_id = $1`, houseID.String).Scan(&user.House.ResidentsCount)
		}

		user.House.Residents = []models.UserProfile{}
		residentRows, _ := r.db.Query(`SELECT id, name, email, profile_picture, pix_key, created_at FROM users WHERE house_id = $1 ORDER BY name ASC`, houseID.String)
		for residentRows.Next() {
			var res models.UserProfile
			residentRows.Scan(&res.ID, &res.Name, &res.Email, &res.ProfilePicture, &res.PixKey, &res.CreatedAt)
			user.House.Residents = append(user.House.Residents, res)
		}
		residentRows.Close()

		user.House.Events = []models.EventProfile{}
		eventRows, _ := r.db.Query(`SELECT id, name, event_date, status FROM events WHERE house_id = $1 AND event_date >= NOW() ORDER BY event_date ASC LIMIT 5`, houseID.String)
		for eventRows.Next() {
			var ev models.EventProfile
			eventRows.Scan(&ev.ID, &ev.Name, &ev.EventDate, &ev.Status)
			user.House.Events = append(user.House.Events, ev)
		}
		eventRows.Close()
	}

	return &models.MeResponse{User: user}, nil
}

func (r *UserRepository) GetUserRole(userID string) (string, error) {
	var role sql.NullString
	query := `SELECT role FROM users WHERE id = $1`
	err := r.db.QueryRow(query, userID).Scan(&role)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}
	return role.String, nil
}

func (r *UserRepository) UpdatePixKey(userID string, pixKey string) error {
	query := `UPDATE users SET pix_key = $1 WHERE id = $2`
	_, err := r.db.Exec(query, pixKey, userID)
	return err
}

func (r *UserRepository) GetUserName(userID string) (string, error) {
	var name string
	query := `SELECT name FROM users WHERE id = $1`
	err := r.db.QueryRow(query, userID).Scan(&name)
	if err != nil {
		return "", err
	}
	return name, nil
}

func (r *UserRepository) DeleteUser(userID string) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(query, userID)
	return err
}

func (r *UserRepository) GetResidentsByHouseID(houseID string) ([]models.UserProfile, error) {
	rows, err := r.db.Query(`SELECT id, name, email, profile_picture, pix_key, created_at FROM users WHERE house_id = $1 ORDER BY name ASC`, houseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var residents []models.UserProfile
	for rows.Next() {
		var u models.UserProfile
		rows.Scan(&u.ID, &u.Name, &u.Email, &u.ProfilePicture, &u.PixKey, &u.CreatedAt)
		residents = append(residents, u)
	}
	return residents, nil
}