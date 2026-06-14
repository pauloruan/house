package repositories

import (
	"database/sql"
	"my-house/internal/models"

	"github.com/google/uuid"
)

type NotificationRepository struct {
	db *sql.DB
}

func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) CreateNotification(houseID, creatorID, title, text string) (*models.Notification, error) {
	id := uuid.New().String()

	query := `INSERT INTO notifications (id, house_id, creator_id, title, text) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.Exec(query, id, houseID, creatorID, title, text)
	if err != nil {
		return nil, err
	}

	return r.getByID(id)
}

func (r *NotificationRepository) GetNotificationsByHouseID(houseID string) ([]models.Notification, error) {
	query := `SELECT id, house_id, creator_id, title, text, created_at FROM notifications WHERE house_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(query, houseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		if err := rows.Scan(&n.ID, &n.HouseID, &n.CreatorID, &n.Title, &n.Text, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}

	return notifications, nil
}

func (r *NotificationRepository) getByID(id string) (*models.Notification, error) {
	query := `SELECT id, house_id, creator_id, title, text, created_at FROM notifications WHERE id = $1`
	var n models.Notification
	err := r.db.QueryRow(query, id).Scan(&n.ID, &n.HouseID, &n.CreatorID, &n.Title, &n.Text, &n.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &n, nil
}
