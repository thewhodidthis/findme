package findme

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const (
	loginpath = "/setup/ws/1/login"
	loginhost = "setup.icloud.com"
)

type data struct {
	Webservices struct {
		Findme struct {
			Status string `json:"status"`
			URL    string `json:"url"`
		}
	}
}

type session struct {
	Payload json.RawMessage
	URL     url.URL
	Cookies []*http.Cookie
}

// Finder helps call the Find My iPhone service for
// device data and will log you in first if need be.
func Finder(user, pass string) func() (*bytes.Buffer, error) {
	l := fmt.Sprintf(`{"apple_id": "%s", "password": "%s", "extended_login": true}`, user, pass)
	s := &session{Payload: json.RawMessage(l)}

	return func() (*bytes.Buffer, error) {
		for _, c := range s.Cookies {
			// Logged in already.
			if c.Name == "X-APPLE-WEBAUTH-USER" && c.Expires.After(time.Now()) {
				return send(s)
			}
		}

		s.URL = url.URL{Scheme: "https", Host: loginhost, Path: loginpath}

		// Log in first, then ask for device data.
		buf, err := send(s)

		if err != nil {
			return nil, err
		}

		var d data

		if err := json.Unmarshal(buf.Bytes(), &d); err != nil {
			return nil, err
		}

		if d.Webservices.Findme.Status != "active" {
			return nil, fmt.Errorf("service disabled: %v", err)
		}

		u, err := url.Parse(d.Webservices.Findme.URL)

		if err != nil {
			return nil, fmt.Errorf("unable to parse service URL: %v", err)
		}

		s.Payload = []byte{}
		s.URL = url.URL{Scheme: "https", Host: u.Hostname(), Path: "/fmipservice/client/web/initClient"}

		return send(s)
	}
}

func send(s *session) (*bytes.Buffer, error) {
	req, err := http.NewRequest(http.MethodPost, s.URL.String(), bytes.NewReader(s.Payload))

	if err != nil {
		return nil, err
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Origin", "https://www.icloud.com")

	for _, c := range s.Cookies {
		// These both need adding, `req.AddCookie()` no good either, go figure!
		if c.Name == "X-APPLE-WEBAUTH-LOGIN" || c.Name == "X-APPLE-WEBAUTH-USER" {
			req.Header.Add("Cookie", fmt.Sprintf("%s=%q", c.Name, c.Value))
		}
	}

	res, err := http.DefaultClient.Do(req)

	if err != nil {
		return nil, err
	}

	// Blanket reject non 200 responses.
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request failed: %v", res.Status)
	}

	defer res.Body.Close()
	var buf bytes.Buffer

	if _, err := io.Copy(&buf, res.Body); err != nil {
		return nil, err
	}

	if s.URL.Hostname() == loginhost {
		// Save for later, but only when first logging in.
		s.Cookies = res.Cookies()
	}

	return &buf, nil
}
