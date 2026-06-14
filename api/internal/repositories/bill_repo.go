package repositories

import (
	"database/sql"
	"errors"
	"my-house/internal/models"
	"time"

	"github.com/google/uuid"
)

type BillRepository struct {
	db *sql.DB
}

func NewBillRepository(db *sql.DB) *BillRepository {
	return &BillRepository{db: db}
}

var ErrBillHasPayments = errors.New("conta possui pagamentos e não pode ser deletada")

func (r *BillRepository) GetBillsByHouseID(houseID string) ([]models.Bill, error) {
	query := `SELECT b.id, b.house_id, b.owner_id, u.name, u.pix_key, b.name, b.total_amount, b.type, b.status, b.due_date, b.created_at
		FROM bills b JOIN users u ON b.owner_id = u.id
		WHERE b.house_id = $1 ORDER BY b.due_date ASC, b.name ASC`
	rows, err := r.db.Query(query, houseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bills []models.Bill
	for rows.Next() {
		var b models.Bill
		var pixKey sql.NullString
		if err := rows.Scan(&b.ID, &b.HouseID, &b.OwnerID, &b.OwnerName, &pixKey, &b.Name, &b.TotalAmount, &b.Type, &b.Status, &b.DueDate, &b.CreatedAt); err != nil {
			return nil, err
		}
		if pixKey.Valid {
			b.OwnerPixKey = &pixKey.String
		}

		b.PaidBy = []string{}
		var paidAmount sql.NullFloat64
		r.db.QueryRow(`SELECT COALESCE(SUM(amount_due), 0) FROM bill_responsibles WHERE bill_id = $1 AND is_paid = true`, b.ID).Scan(&paidAmount)
		if paidAmount.Valid {
			b.PaidAmount = paidAmount.Float64
		}

		paidRows, _ := r.db.Query(`SELECT user_id FROM bill_responsibles WHERE bill_id = $1 AND is_paid = true`, b.ID)
		for paidRows.Next() {
			var uid string
			paidRows.Scan(&uid)
			b.PaidBy = append(b.PaidBy, uid)
		}
		paidRows.Close()

		b.Residents = []models.ResidentInfo{}
		resRows, _ := r.db.Query(`
			SELECT u.id, u.name, u.profile_picture, br.bill_id IS NOT NULL as selected
			FROM users u
			LEFT JOIN bill_responsibles br ON br.user_id = u.id AND br.bill_id = $1
			WHERE u.house_id = $2
			ORDER BY u.name ASC`, b.ID, houseID)
		for resRows.Next() {
			var ri models.ResidentInfo
			resRows.Scan(&ri.ID, &ri.Name, &ri.ProfilePicture, &ri.Selected)
			b.Residents = append(b.Residents, ri)
		}
		resRows.Close()

		bills = append(bills, b)
	}

	return bills, nil
}

func (r *BillRepository) CreateBill(houseID, ownerID, name, billType string, totalAmount float64, dueDate time.Time, residentIDs []string) (*models.Bill, error) {
	id := uuid.New().String()

	query := `INSERT INTO bills (id, house_id, owner_id, name, total_amount, type, status, due_date) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)`
	_, err := r.db.Exec(query, id, houseID, ownerID, name, totalAmount, billType, dueDate)
	if err != nil {
		return nil, err
	}

	if len(residentIDs) == 0 {
		rows, _ := r.db.Query(`SELECT id FROM users WHERE house_id = $1`, houseID)
		for rows.Next() {
			var uid string
			rows.Scan(&uid)
			residentIDs = append(residentIDs, uid)
		}
		rows.Close()
	}

	hasCreator := false
	for _, rid := range residentIDs {
		if rid == ownerID {
			hasCreator = true
		}
	}
	if !hasCreator {
		residentIDs = append(residentIDs, ownerID)
	}

	if len(residentIDs) > 0 {
		amountDue := totalAmount / float64(len(residentIDs))
		for _, rid := range residentIDs {
			r.db.Exec(`INSERT INTO bill_responsibles (bill_id, user_id, amount_due, is_paid) VALUES ($1, $2, $3, false) ON CONFLICT DO NOTHING`, id, rid, amountDue)
		}
		r.computeStatus(id)
	}

	return r.getByID(id)
}

func (r *BillRepository) UpdateBill(billID, userID, name, billType string, totalAmount float64, dueDate time.Time, status string, residentIDs []string) (*models.Bill, error) {
	query := `UPDATE bills SET name = $1, type = $2, total_amount = $3, due_date = $4, status = $5 WHERE id = $6 AND owner_id = $7`
	_, err := r.db.Exec(query, name, billType, totalAmount, dueDate, status, billID, userID)
	if err != nil {
		return nil, err
	}

	if len(residentIDs) > 0 {
		r.db.Exec(`DELETE FROM bill_responsibles WHERE bill_id = $1 AND is_paid = false`, billID)
		amountDue := totalAmount / float64(len(residentIDs))
		for _, rid := range residentIDs {
			r.db.Exec(`INSERT INTO bill_responsibles (bill_id, user_id, amount_due, is_paid) VALUES ($1, $2, $3, false) ON CONFLICT (bill_id, user_id) DO UPDATE SET amount_due = $3 WHERE bill_responsibles.is_paid = false`, billID, rid, amountDue)
		}
	}

	r.computeStatus(billID)
	return r.getByID(billID)
}

func (r *BillRepository) DeleteBill(billID, userID string) error {
	var payments int
	r.db.QueryRow(`SELECT COUNT(*) FROM bill_responsibles WHERE bill_id = $1 AND is_paid = true`, billID).Scan(&payments)
	if payments > 0 {
		return ErrBillHasPayments
	}

	result, err := r.db.Exec(`DELETE FROM bills WHERE id = $1 AND owner_id = $2`, billID, userID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *BillRepository) PayBill(billID, userID string) (*models.Bill, error) {
	var houseID string
	var totalAmount float64
	r.db.QueryRow(`SELECT house_id, total_amount FROM bills WHERE id = $1`, billID).Scan(&houseID, &totalAmount)

	var residentsCount int
	r.db.QueryRow(`SELECT COUNT(*) FROM users WHERE house_id = $1`, houseID).Scan(&residentsCount)

	amountDue := totalAmount
	if residentsCount > 0 {
		amountDue = totalAmount / float64(residentsCount)
	}

	_, err := r.db.Exec(
		`INSERT INTO bill_responsibles (bill_id, user_id, amount_due, is_paid) VALUES ($1, $2, $3, true)
		 ON CONFLICT (bill_id, user_id) DO UPDATE SET is_paid = true`,
		billID, userID, amountDue,
	)
	if err != nil {
		return nil, err
	}

	r.computeStatus(billID)
	return r.getByID(billID)
}

func (r *BillRepository) computeStatus(billID string) {
	var total, paid int
	r.db.QueryRow(`SELECT COUNT(*) FROM users u, bills b WHERE b.id = $1 AND u.house_id = b.house_id`, billID).Scan(&total)
	r.db.QueryRow(`SELECT COUNT(*) FROM bill_responsibles WHERE bill_id = $1 AND is_paid = true`, billID).Scan(&paid)

	status := "pending"
	if paid > 0 && paid < total {
		status = "partial"
	} else if paid >= total {
		status = "paid"
	}

	r.db.Exec(`UPDATE bills SET status = $1 WHERE id = $2`, status, billID)
}

func (r *BillRepository) HasPayments(billID string) bool {
	var count int
	r.db.QueryRow(`SELECT COUNT(*) FROM bill_responsibles WHERE bill_id = $1 AND is_paid = true`, billID).Scan(&count)
	return count > 0
}

func (r *BillRepository) getByID(id string) (*models.Bill, error) {
	return r.GetBillByID(id)
}

func (r *BillRepository) GetBillByID(id string) (*models.Bill, error) {
	query := `SELECT b.id, b.house_id, b.owner_id, u.name, u.pix_key, b.name, b.total_amount, b.type, b.status, b.due_date, b.created_at
		FROM bills b JOIN users u ON b.owner_id = u.id WHERE b.id = $1`
	var b models.Bill
	var pixKey sql.NullString
	err := r.db.QueryRow(query, id).Scan(&b.ID, &b.HouseID, &b.OwnerID, &b.OwnerName, &pixKey, &b.Name, &b.TotalAmount, &b.Type, &b.Status, &b.DueDate, &b.CreatedAt)
	if err != nil {
		return nil, err
	}
	if pixKey.Valid {
		b.OwnerPixKey = &pixKey.String
	}

	r.populateBillDetails(&b)
	return &b, nil
}

func (r *BillRepository) populateBillDetails(b *models.Bill) {
	b.PaidBy = []string{}
	b.Residents = []models.ResidentInfo{}

	var paidAmount sql.NullFloat64
	r.db.QueryRow(`SELECT COALESCE(SUM(amount_due), 0) FROM bill_responsibles WHERE bill_id = $1 AND is_paid = true`, b.ID).Scan(&paidAmount)
	if paidAmount.Valid {
		b.PaidAmount = paidAmount.Float64
	}

	paidRows, _ := r.db.Query(`SELECT user_id FROM bill_responsibles WHERE bill_id = $1 AND is_paid = true`, b.ID)
	for paidRows.Next() {
		var uid string
		paidRows.Scan(&uid)
		b.PaidBy = append(b.PaidBy, uid)
	}
	paidRows.Close()

	residentRows, _ := r.db.Query(`
		SELECT u.id, u.name, u.profile_picture, COALESCE(br.bill_id IS NOT NULL, false) as selected
		FROM users u
		LEFT JOIN bill_responsibles br ON br.user_id = u.id AND br.bill_id = $1
		WHERE u.house_id = (SELECT house_id FROM bills WHERE id = $1)
		ORDER BY u.name ASC`, b.ID)
	for residentRows.Next() {
		var ri models.ResidentInfo
		residentRows.Scan(&ri.ID, &ri.Name, &ri.ProfilePicture, &ri.Selected)
		b.Residents = append(b.Residents, ri)
	}
	residentRows.Close()
}
