package models

import "time"

type WishlistItem struct {
	ID        string    `json:"id"`
	HouseID   string    `json:"house_id"`
	UserID    string    `json:"user_id"`
	UserName  string    `json:"user_name"`
	URL       string    `json:"url"`
	Title     string    `json:"title"`
	ImageURL  string    `json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
}
