package handlers

import (
	"net/http"
	"os"
	"path/filepath"
)

// ServeSwaggerUI serve o Swagger UI HTML
func ServeSwaggerUI(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	swaggerHTML := `
<!DOCTYPE html>
<html>
<head>
  <title>My House API - Swagger UI</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      console.log("Iniciando Swagger UI...");
      
      const ui = SwaggerUIBundle({
        url: "/docs/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        onComplete: function() {
          console.log("Swagger UI inicializado com sucesso!");
        }
      });
      
      window.ui = ui;
    });
  </script>
</body>
</html>
`
	w.Write([]byte(swaggerHTML))
}

// ServeOpenAPISpec serve o arquivo OpenAPI JSON
func ServeOpenAPISpec(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Se for uma requisição OPTIONS, apenas retorna 200
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Buscar o arquivo OpenAPI na pasta docs
	exePath, _ := os.Executable()
	exeDir := filepath.Dir(exePath)
	openAPIPath := filepath.Join(exeDir, "docs", "openapi.json")

	// Se não encontrar, tentar no diretório de trabalho atual
	if _, err := os.Stat(openAPIPath); err != nil {
		openAPIPath = "./docs/openapi.json"
	}

	data, err := os.ReadFile(openAPIPath)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error": "OpenAPI spec não encontrado"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(data)
}
