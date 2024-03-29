## about

Yet another take on the old [sosumi](https://en.wikipedia.org/wiki/Sosumi) class. Tracks device data only.

## setup

Fetch the latest version from GitHub directly:

```sh
# No side deps
go get github.com/thewhodidthis/findme
```

## usage

Pass in an Apple ID and password to get back a device info probing function that handles extended logins using the `X-APPLE-WEBAUTH-LOGIN` cookie. For example:

```golang
finder := findme.Finder(os.Getenv("APPLE_ID"), os.Getenv("PASSWORD"))
runner := func() {
  buf, err := finder()

  if err != nil {
    log.Fatalf("unable to complete request: %v", err)
  }

  if _, err := io.Copy(os.Stdout, buf); err != nil {
    log.Fatalf("unable to read response: %v", err)
  }
}

// Expect a notification on your device when first logging in, but repeated
// alerts should be skipped for a few days until that cookie expires.
runner()
time.Sleep(5 * time.Second)
runner()
```

## see also

- [find-my-iphone](https://github.com/matt-kruse/find-my-iphone)
