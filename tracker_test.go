package findme

import (
	"io"
	"os"
	"testing"
)

func TestFinder(t *testing.T) {
	f := Finder(os.Getenv("APPLE_ID"), os.Getenv("PASSWORD"))
	b, err := f()

	if err != nil {
		t.Errorf("failed to complete request: %v", err)
		t.Fail()
	}

	if _, err := io.Copy(io.Discard, b); err != nil {
		t.Errorf("failed to read response: %v", err)
		t.Fail()
	}
}
