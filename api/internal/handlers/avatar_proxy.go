package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
)

type cacheEntry struct {
	data      []byte
	mimeType  string
	fetchedAt time.Time
}

type AvatarProxy struct {
	cache sync.Map
	ttl   time.Duration
}

func NewAvatarProxy() *AvatarProxy {
	return &AvatarProxy{
		ttl: 24 * time.Hour,
	}
}

func (p *AvatarProxy) Handle(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	if url == "" {
		http.Error(w, "missing url parameter", http.StatusBadRequest)
		return
	}

	if !strings.HasPrefix(url, "https://lh3.googleusercontent.com/") {
		http.Error(w, "invalid url domain", http.StatusBadRequest)
		return
	}

	hash := sha256.Sum256([]byte(url))
	key := hex.EncodeToString(hash[:])

	if entry, ok := p.cache.Load(key); ok {
		e := entry.(*cacheEntry)
		if time.Since(e.fetchedAt) < p.ttl {
			w.Header().Set("Content-Type", e.mimeType)
			w.Header().Set("Cache-Control", "public, max-age=86400")
			w.Write(e.data)
			return
		}
		p.cache.Delete(key)
	}

	resp, err := http.Get(url)
	if err != nil {
		log.Printf("❌ Erro ao buscar avatar: %v", err)
		http.Error(w, "failed to fetch avatar", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "upstream returned error", resp.StatusCode)
		return
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "failed to read response", http.StatusInternalServerError)
		return
	}

	mimeType := resp.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "image/jpeg"
	}

	p.cache.Store(key, &cacheEntry{
		data:      data,
		mimeType:  mimeType,
		fetchedAt: time.Now(),
	})

	w.Header().Set("Content-Type", mimeType)
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Write(data)
}
