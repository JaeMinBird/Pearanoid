package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// Config represents the application configuration
type Config struct {
	Port     string
	DataPath string
}

// Server represents the HTTP server and its dependencies
type Server struct {
	config Config
	router *http.ServeMux
}

// VaultEntry represents a single credential entry in the vault
type VaultEntry struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"` // Encrypted
	Section  string `json:"section"`
	Notes    string `json:"notes"` // Encrypted
}

// Vault represents the encrypted vault structure
type Vault struct {
	Version int          `json:"version"`
	Entries []VaultEntry `json:"entries"`
}

func main() {
	// Initialize configuration
	config := Config{
		Port:     getEnv("PORT", "8080"),
		DataPath: getEnv("DATA_PATH", "/data"),
	}

	// Ensure data directory exists
	err := os.MkdirAll(config.DataPath, 0755)
	if err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	// Initialize and start server
	server := newServer(config)
	server.routes()

	log.Printf("Starting Pearanoid API server on port %s", config.Port)
	log.Printf("Using data path: %s", config.DataPath)

	err = http.ListenAndServe(":"+config.Port, server.router)
	if err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

func newServer(config Config) *Server {
	return &Server{
		config: config,
		router: http.NewServeMux(),
	}
}

func (s *Server) routes() {
	// API routes
	s.router.HandleFunc("GET /api/vault", s.handleGetVault)
	s.router.HandleFunc("POST /api/vault", s.handleSaveVault)
	s.router.HandleFunc("GET /api/health", s.handleHealthCheck)
}

func (s *Server) handleHealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (s *Server) handleGetVault(w http.ResponseWriter, r *http.Request) {
	// Check authentication
	if !s.authenticate(r) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Read vault file
	vaultPath := filepath.Join(s.config.DataPath, "vault.db")
	data, err := os.ReadFile(vaultPath)
	if err != nil {
		if os.IsNotExist(err) {
			// If the vault doesn't exist yet, return an empty vault
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(Vault{Version: 1, Entries: []VaultEntry{}})
			return
		}
		
		log.Printf("Error reading vault: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Return encrypted vault data
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func (s *Server) handleSaveVault(w http.ResponseWriter, r *http.Request) {
	// Check authentication
	if !s.authenticate(r) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Read request body
	var vault Vault
	err := json.NewDecoder(r.Body).Decode(&vault)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Verify data format
	if vault.Version != 1 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid vault version"})
		return
	}

	// Save vault to file
	vaultPath := filepath.Join(s.config.DataPath, "vault.db")
	data, err := json.Marshal(vault)
	if err != nil {
		log.Printf("Error marshaling vault: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = os.WriteFile(vaultPath, data, 0600)
	if err != nil {
		log.Printf("Error writing vault: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// authenticate validates the request authentication
// For initial implementation, this uses a simple token-based auth
func (s *Server) authenticate(r *http.Request) bool {
	token := r.Header.Get("Authorization")
	expectedToken := getEnv("AUTH_TOKEN", "")
	
	// In a production environment, you would use a more secure authentication method
	if expectedToken == "" {
		return true // Allow all requests if no token is set (for development only)
	}
	
	return token == "Bearer "+expectedToken
}

// getEnv gets an environment variable or returns the default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
} 