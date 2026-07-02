package repositories

import (
	"database/sql"
	"my-house/internal/models"
	"time"

	"github.com/google/uuid"
)

type EventRepository struct {
	db *sql.DB
}

func NewEventRepository(db *sql.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) GetEventsByHouseID(houseID string) ([]models.Event, error) {
	query := `SELECT e.id, e.house_id, e.creator_id, COALESCE(u.name, ''), e.name, COALESCE(e.description, ''), e.event_date, 
		COALESCE(e.periodicity, ''), COALESCE(e.address, ''), e.status, e.created_at
		FROM events e LEFT JOIN users u ON e.creator_id = u.id
		WHERE e.house_id = $1 ORDER BY e.event_date ASC`
	rows, err := r.db.Query(query, houseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var e models.Event
		rows.Scan(&e.ID, &e.HouseID, &e.CreatorID, &e.CreatorName, &e.Name, &e.Description, &e.EventDate,
			&e.Periodicity, &e.Address, &e.Status, &e.CreatedAt)
		e.Participants = r.getParticipants(e.ID)
		events = append(events, e)
	}
	return events, nil
}

func (r *EventRepository) GetEventByID(id string) (*models.Event, error) {
	query := `SELECT e.id, e.house_id, e.creator_id, COALESCE(u.name, ''), e.name, COALESCE(e.description, ''), e.event_date,
		COALESCE(e.periodicity, ''), COALESCE(e.address, ''), e.status, e.created_at
		FROM events e LEFT JOIN users u ON e.creator_id = u.id WHERE e.id = $1`
	var e models.Event
	err := r.db.QueryRow(query, id).Scan(&e.ID, &e.HouseID, &e.CreatorID, &e.CreatorName, &e.Name, &e.Description,
		&e.EventDate, &e.Periodicity, &e.Address, &e.Status, &e.CreatedAt)
	if err != nil {
		return nil, err
	}
	e.Participants = r.getParticipants(e.ID)
	return &e, nil
}

func (r *EventRepository) CreateEvent(houseID, creatorID, name, description, periodicity, address string, eventDate time.Time, participantIDs []string) (*models.Event, error) {
	id := uuid.New().String()

	query := `INSERT INTO events (id, house_id, creator_id, name, description, event_date, periodicity, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.Exec(query, id, houseID, creatorID, name, description, eventDate, periodicity, address)
	if err != nil {
		return nil, err
	}

	if len(participantIDs) == 0 {
		rows, err := r.db.Query(`SELECT id FROM users WHERE house_id = $1`, houseID)
		if err == nil {
			for rows.Next() {
				var uid string
				rows.Scan(&uid)
				participantIDs = append(participantIDs, uid)
			}
			rows.Close()
		}
	}

	hasCreator := false
	for _, pid := range participantIDs {
		if pid == creatorID {
			hasCreator = true
		}
	}
	if !hasCreator {
		participantIDs = append(participantIDs, creatorID)
	}

	for _, pid := range participantIDs {
		r.db.Exec(`INSERT INTO event_participants (event_id, user_id, confirmed) VALUES ($1, $2, false) ON CONFLICT DO NOTHING`, id, pid)
	}

	return r.GetEventByID(id)
}

func (r *EventRepository) UpdateEvent(eventID, creatorID, name, description, periodicity, address string, eventDate time.Time, participantIDs []string) (*models.Event, error) {
	query := `UPDATE events SET name = $1, description = $2, event_date = $3, periodicity = $4, address = $5 WHERE id = $6 AND creator_id = $7`
	_, err := r.db.Exec(query, name, description, eventDate, periodicity, address, eventID, creatorID)
	if err != nil {
		return nil, err
	}

	r.db.Exec(`DELETE FROM event_participants WHERE event_id = $1`, eventID)
	for _, pid := range participantIDs {
		r.db.Exec(`INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, eventID, pid)
	}

	return r.GetEventByID(eventID)
}

func (r *EventRepository) DeleteEvent(eventID, userID string) error {
	_, err := r.db.Exec(`DELETE FROM events WHERE id = $1 AND creator_id = $2`, eventID, userID)
	return err
}

func (r *EventRepository) ConfirmPresence(eventID, userID string) error {
	_, err := r.db.Exec(`INSERT INTO event_participants (event_id, user_id, confirmed) VALUES ($1, $2, true) ON CONFLICT (event_id, user_id) DO UPDATE SET confirmed = true`, eventID, userID)
	return err
}

func (r *EventRepository) getParticipants(eventID string) []models.Participant {
	rows, err := r.db.Query(`
		SELECT u.id, u.name, u.profile_picture, COALESCE(ep.confirmed, false) as confirmed
		FROM users u
		INNER JOIN event_participants ep ON ep.user_id = u.id AND ep.event_id = $1
		ORDER BY u.name ASC`, eventID)
	if err != nil {
		return []models.Participant{}
	}
	defer rows.Close()

	var participants []models.Participant
	for rows.Next() {
		var p models.Participant
		rows.Scan(&p.ID, &p.Name, &p.ProfilePicture, &p.Confirmed)
		participants = append(participants, p)
	}
	return participants
}
