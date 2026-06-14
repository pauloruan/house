package models

import "time"

type Event struct {
	ID           string          `json:"id"`
	HouseID      string          `json:"house_id"`
	CreatorID    string          `json:"creator_id"`
	CreatorName  string          `json:"creator_name"`
	Name         string          `json:"name"`
	Description  string          `json:"description"`
	EventDate    time.Time       `json:"event_date"`
	Periodicity  string          `json:"periodicity"`
	Address      string          `json:"address"`
	Status       string          `json:"status"`
	CreatedAt    time.Time       `json:"created_at"`
	Participants []Participant   `json:"participants"`
}

type Participant struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	ProfilePicture string `json:"profile_picture"`
	Confirmed      bool   `json:"confirmed"`
}
