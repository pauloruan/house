package models

import "time"

type Bill struct {
	ID           string          `json:"id"`
	HouseID      string          `json:"house_id"`
	OwnerID      string          `json:"owner_id"`
	OwnerName    string          `json:"owner_name"`
	OwnerPixKey  *string         `json:"owner_pix_key,omitempty"`
	Name         string          `json:"name"`
	TotalAmount  float64         `json:"total_amount"`
	PaidAmount   float64         `json:"paid_amount"`
	Type         string          `json:"type"`
	Status       string          `json:"status"`
	DueDate      time.Time       `json:"due_date"`
	CreatedAt    time.Time       `json:"created_at"`
	PaidBy       []string        `json:"paid_by"`
	Residents    []ResidentInfo  `json:"residents"`
}

type ResidentInfo struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	ProfilePicture string `json:"profile_picture"`
	Selected       bool   `json:"selected"`
}
