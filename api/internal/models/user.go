package models

import "time"

type User struct {
	ID             string
	GoogleID       string
	Name           string
	Email          string
	ProfilePicture string
	PixKey         *string
	HouseID        *string
	Role           *string
	InviteCode     *string
	CreatedAt      time.Time
}
