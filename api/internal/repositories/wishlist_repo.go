package repositories

import (
	"database/sql"
	"my-house/internal/models"

	"github.com/google/uuid"
)

type WishlistRepository struct {
	db *sql.DB
}

func NewWishlistRepository(db *sql.DB) *WishlistRepository {
	return &WishlistRepository{db: db}
}

func (r *WishlistRepository) GetByHouseID(houseID string) ([]models.WishlistItem, error) {
	rows, err := r.db.Query(`SELECT w.id, w.house_id, w.user_id, u.name, w.url, w.title, w.image_url, w.created_at
		FROM wishlist_items w JOIN users u ON w.user_id = u.id
		WHERE w.house_id = $1 ORDER BY w.created_at DESC`, houseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.WishlistItem
	for rows.Next() {
		var item models.WishlistItem
		rows.Scan(&item.ID, &item.HouseID, &item.UserID, &item.UserName, &item.URL, &item.Title, &item.ImageURL, &item.CreatedAt)
		items = append(items, item)
	}
	return items, nil
}

func (r *WishlistRepository) Create(houseID, userID, url, title, imageURL string) (*models.WishlistItem, error) {
	id := uuid.New().String()
	_, err := r.db.Exec(`INSERT INTO wishlist_items (id, house_id, user_id, url, title, image_url) VALUES ($1, $2, $3, $4, $5, $6)`,
		id, houseID, userID, url, title, imageURL)
	if err != nil {
		return nil, err
	}
	return r.GetByID(id)
}

func (r *WishlistRepository) Delete(id, userID string) error {
	_, err := r.db.Exec(`DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2`, id, userID)
	return err
}

func (r *WishlistRepository) GetByID(id string) (*models.WishlistItem, error) {
	var item models.WishlistItem
	err := r.db.QueryRow(`SELECT w.id, w.house_id, w.user_id, u.name, w.url, w.title, w.image_url, w.created_at
		FROM wishlist_items w JOIN users u ON w.user_id = u.id WHERE w.id = $1`, id).
		Scan(&item.ID, &item.HouseID, &item.UserID, &item.UserName, &item.URL, &item.Title, &item.ImageURL, &item.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}
