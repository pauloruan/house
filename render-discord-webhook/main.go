package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type RenderWebhook struct {
	Action       string `json:"action"`
	Service      struct {
		Name string `json:"name"`
	} `json:"service"`
	Deploy struct {
		ID     string `json:"id"`
		Status string `json:"status"`
		Commit struct {
			Message string `json:"message"`
		} `json:"commit"`
	} `json:"deploy"`
}

type DiscordMessage struct {
	Content string `json:"content"`
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Erro ao ler body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	var hook RenderWebhook
	if err := json.Unmarshal(body, &hook); err != nil {
		log.Printf("Erro ao parsear JSON: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	discordURL := os.Getenv("DISCORD_WEBHOOK_URL")
	if discordURL == "" {
		log.Println("DISCORD_WEBHOOK_URL não configurada")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	emoji := "🚀"
	status := "triggered"
	if hook.Deploy.Status != "" {
		status = hook.Deploy.Status
	}
	switch status {
	case "live":
		emoji = "✅"
	case "failed":
		emoji = "❌"
	case "canceled":
		emoji = "⚠️"
	case "build_in_progress", "update_in_progress":
		emoji = "🔨"
	}

	msg := fmt.Sprintf("%s **%s** deploy %s", emoji, hook.Service.Name, status)
	if hook.Deploy.Commit.Message != "" {
		msg += fmt.Sprintf("\n> %s", hook.Deploy.Commit.Message)
	}

	discordMsg := DiscordMessage{Content: msg}
	jsonMsg, _ := json.Marshal(discordMsg)

	resp, err := http.Post(discordURL, "application/json", bytes.NewBuffer(jsonMsg))
	if err != nil {
		log.Printf("Erro ao enviar para Discord: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	log.Printf("Notificação enviada: %s - %s", hook.Service.Name, status)
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "OK")
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/webhook", handleWebhook)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "OK")
	})

	log.Printf("Webhook bridge rodando na porta %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Erro ao iniciar servidor: %v", err)
	}
}
