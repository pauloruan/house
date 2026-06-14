package services

import (
	"io"
	"my-house/internal/models"
	"my-house/internal/repositories"
	"net/http"
	"strings"

	"golang.org/x/net/html"
)

type WishlistService struct {
	repo      *repositories.WishlistRepository
	wsService *WebSocketService
}

func NewWishlistService(repo *repositories.WishlistRepository, wsService *WebSocketService) *WishlistService {
	return &WishlistService{repo: repo, wsService: wsService}
}

func (s *WishlistService) GetItems(houseID string) ([]models.WishlistItem, error) {
	items, err := s.repo.GetByHouseID(houseID)
	if err != nil {
		return nil, err
	}
	if items == nil {
		items = []models.WishlistItem{}
	}
	return items, nil
}

func (s *WishlistService) AddItem(houseID, userID, url string) (*models.WishlistItem, error) {
	title, imageURL := fetchMetadata(url)
	item, err := s.repo.Create(houseID, userID, url, title, imageURL)
	if err != nil {
		return nil, err
	}
	s.wsService.BroadcastToHouse(houseID, "wishlist-created", item)
	return item, nil
}

func (s *WishlistService) DeleteItem(id, userID string) error {
	item, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if err := s.repo.Delete(id, userID); err != nil {
		return err
	}
	s.wsService.BroadcastToHouse(item.HouseID, "wishlist-deleted", map[string]string{"id": id})
	return nil
}

func fetchMetadata(url string) (title, imageURL string) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return url, ""
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; MyHouse/1.0)")

	resp, err := client.Do(req)
	if err != nil {
		return url, ""
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 1024*1024))
	doc, err := html.Parse(strings.NewReader(string(body)))
	if err != nil {
		return url, ""
	}

	title, imageURL = parseMeta(doc)
	if title == "" {
		title = url
	}

	title = strings.TrimSpace(title)
	imageURL = strings.TrimSpace(imageURL)

	if imageURL != "" && !strings.HasPrefix(imageURL, "http") {
		imageURL = ""
	}

	return title, imageURL
}

func parseMeta(n *html.Node) (title, image string) {
	if n.Type == html.ElementNode && n.Data == "meta" {
		var property, nameAttr, itemprop, content string
		for _, a := range n.Attr {
			switch a.Key {
			case "property", "name":
				if a.Val == "og:title" || a.Val == "twitter:title" {
					property = a.Val
				}
				if a.Val == "og:image" || a.Val == "og:image:secure_url" || a.Val == "twitter:image" {
					nameAttr = a.Val
				}
			case "itemprop":
				if a.Val == "image" {
					itemprop = a.Val
				}
			case "content":
				content = a.Val
			}
		}

		if (property == "og:title" || property == "twitter:title") && title == "" {
			title = content
		}
		if (nameAttr == "og:image" || nameAttr == "og:image:secure_url" || nameAttr == "twitter:image" || itemprop == "image") && image == "" {
			image = content
		}
	}

	if n.Type == html.ElementNode && n.Data == "link" {
		var rel, href string
		for _, a := range n.Attr {
			if a.Key == "rel" {
				rel = a.Val
			}
			if a.Key == "href" {
				href = a.Val
			}
		}
		if rel == "image_src" && image == "" {
			image = href
		}
	}

	if n.Type == html.ElementNode && n.Data == "title" {
		if n.FirstChild != nil && title == "" {
			title = n.FirstChild.Data
		}
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		t, i := parseMeta(c)
		if title == "" && t != "" {
			title = t
		}
		if image == "" && i != "" {
			image = i
		}
	}

	return title, image
}
