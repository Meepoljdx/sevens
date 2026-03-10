package main

import (
	"fmt"
	"log"
	"net/http"

	"sevens/game"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func main() {
	world := game.NewWorld()
	go world.Run()

	// Serve static files
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	// WebSocket endpoint
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("WebSocket upgrade error: %v", err)
			return
		}
		log.Printf("New WebSocket connection from %s", r.RemoteAddr)
		world.HandleConnection(conn)
	})

	port := "8080"
	fmt.Println("======================================")
	fmt.Println("  SEVENS: RPG Server")
	fmt.Printf("  http://localhost:%s\n", port)
	fmt.Println("======================================")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
