package models

import "time"

type BillProfile struct {
	ID      string    `json:"id"`
	Title   string    `json:"title"`
	Amount  float64   `json:"amount"`
	DueDate time.Time `json:"due_date"`
	Status  string    `json:"status"`
}

type HouseProfile struct {
	ID             string        `json:"id"`
	Name           string        `json:"name"`
	Role           string        `json:"role"`
	JoinedAt       time.Time     `json:"joined_at"`
	Bills          []BillProfile `json:"bills"`
	InviteCode     *string       `json:"invite_code,omitempty"`
	ResidentsCount int           `json:"residents_count"`
	Residents      []UserProfile `json:"residents"`
	Events         []EventProfile `json:"events"`
}

type UserProfile struct {
	ID             string        `json:"id"`
	Name           string        `json:"name"`
	Email          string        `json:"email"`
	ProfilePicture string        `json:"profile_picture"`
	PixKey         *string       `json:"pix_key"`
	CreatedAt      time.Time     `json:"created_at"`
	House          *HouseProfile `json:"house,omitempty"`
}

type MeResponse struct {
	User UserProfile `json:"user"`
}

type EventProfile struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	EventDate time.Time `json:"event_date"`
	Status    string    `json:"status"`
}
