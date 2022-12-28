package main

import (
	"io"
	"log"
	"os"
	"time"

	"github.com/thewhodidthis/findme"
)

func main() {
	finder := findme.Finder(os.Getenv("APPLE_ID"), os.Getenv("PASSWORD"))
	runner := func() {
		buf, err := finder()

		if err != nil {
			log.Fatalf("main: unable to complete request: %v", err)
		}

		if _, err := io.Copy(os.Stdout, buf); err != nil {
			log.Fatalf("main: unable to read response: %v", err)
		}
	}

	runner()
	time.Sleep(5 * time.Second)
	runner()
}
