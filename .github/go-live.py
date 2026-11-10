"""Turns the site's "Coming to the App Store" key into the real one, once the app is there.

Run every hour by .github/workflows/go-live.yml. It asks Apple's public lookup whether the
app is on the store in any of a few countries; until then it changes nothing. When it is,
the key on the home page gets its light and its words, and the workflow switches itself off.
"""
import json, os, urllib.request

APP = os.environ.get("APP_ID", "6832922834")
PAGE = os.environ.get("PAGE", "index.html")
SOON = '<a class="key soon" href="https://apps.apple.com/app/id6832922834">Coming to the App Store</a>'
LIVE = '<a class="key" href="https://apps.apple.com/app/id6832922834">Get Seedlands on the App Store</a>'

def on_the_store():
    for country in ("us", "ch", "de", "gb"):
        try:
            with urllib.request.urlopen(f"https://itunes.apple.com/lookup?id={APP}&country={country}", timeout=30) as r:
                if json.load(r).get("resultCount", 0) > 0:
                    print("on the store in", country)
                    return True
        except Exception as error:
            print("lookup failed for", country, "-", error)
    return False

def tell(**outputs):
    path = os.environ.get("GITHUB_OUTPUT")
    for key, value in outputs.items():
        print(f"{key}={value}")
        if path:
            with open(path, "a") as f: f.write(f"{key}={value}\n")

page = open(PAGE, encoding="utf-8").read()
if SOON not in page:
    print("the key already leads to the store")
    tell(changed="false", done="true")
elif on_the_store():
    open(PAGE, "w", encoding="utf-8").write(page.replace(SOON, LIVE))
    tell(changed="true", done="true")
else:
    print("not on the store yet")
    tell(changed="false", done="false")
