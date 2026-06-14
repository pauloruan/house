package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"my-house/internal/services"
	"net/http"
	"net/url"
	"time"

	"golang.org/x/oauth2"
)

type AuthHandler struct {
	oauthConf   *oauth2.Config
	authService *services.AuthService
	frontendURL string
}

func NewAuthHandler(conf *oauth2.Config, service *services.AuthService, frontendURL string) *AuthHandler {
	return &AuthHandler{
		oauthConf:   conf,
		authService: service,
		frontendURL: frontendURL,
	}
}

func generateStateOauthCookie(w http.ResponseWriter) string {
	expiration := time.Now().Add(20 * time.Minute)

	b := make([]byte, 16)
	rand.Read(b)
	state := base64.URLEncoding.EncodeToString(b)

	cookie := http.Cookie{
		Name:     "oauthstate",
		Value:    state,
		Expires:  expiration,
		HttpOnly: true,
		Secure:   false,
		Path:     "/",
	}
	http.SetCookie(w, &cookie)

	return state
}

func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	state := generateStateOauthCookie(w)

	url := h.oauthConf.AuthCodeURL(state)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	oauthState, err := r.Cookie("oauthstate")
	if err != nil {
		http.Error(w, "State cookie não encontrado", http.StatusBadRequest)
		return
	}

	if r.FormValue("state") != oauthState.Value {
		http.Error(w, "State inválido (possível ataque CSRF)", http.StatusBadRequest)
		return
	}

	code := r.FormValue("code")
	if code == "" {
		http.Error(w, "Código não encontrado", http.StatusBadRequest)
		return
	}

	token, err := h.oauthConf.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Falha ao trocar o token", http.StatusInternalServerError)
		return
	}

	client := h.oauthConf.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		http.Error(w, "Falha ao buscar dados do utilizador", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var googleUser services.GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		http.Error(w, "Falha ao decodificar dados", http.StatusInternalServerError)
		return
	}

	tokenString, err := h.authService.ProcessGoogleLogin(googleUser)
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao processar login: %v", err), http.StatusInternalServerError)
		return
	}

	safeName := url.QueryEscape(googleUser.Name)
	safePicture := url.QueryEscape(googleUser.Picture)

	callbackURL := fmt.Sprintf("%s/auth/callback?token=%s&id=%s&name=%s&picture=%s",
		h.frontendURL,
		tokenString,
		googleUser.ID,
		safeName,
		safePicture,
	)

	http.Redirect(w, r, callbackURL, http.StatusFound)
}
