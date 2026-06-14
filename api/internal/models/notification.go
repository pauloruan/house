package models

import "time"

type Notification struct {
	ID        string    `json:"id"`
	HouseID   string    `json:"house_id"`
	CreatorID string    `json:"creator_id"`
	Title     string    `json:"title"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"created_at"`
}
