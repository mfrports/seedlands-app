"""Turns the site's "Coming to the App Store" keys into the real ones, once the app is there.

Run every hour by .github/workflows/go-live.yml. It asks Apple's public lookup whether the
app is on the store in any of a few countries; until then it changes nothing. When it is,
the key gets its light and its words on every page that carries it (the home page has it
twice, the mod's page once), and the workflow switches itself off.

A page keeps working with this only while its key is written exactly as SOON below.
"""
import glob, json, os, urllib.request

APP = os.environ.get("APP_ID", "6832922834")
PAGES = sorted(glob.glob(os.environ.get("PAGES", "*.html")))
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

waiting = [p for p in PAGES if SOON in open(p, encoding="utf-8").read()]
if not waiting:
    print("the keys already lead to the store")
    tell(changed="false", done="true")
elif on_the_store():
    for p in waiting:
        page = open(p, encoding="utf-8").read()
        open(p, "w", encoding="utf-8").write(page.replace(SOON, LIVE))
        print("changed", p)
    tell(changed="true", done="true")
else:
    print("not on the store yet")
    tell(changed="false", done="false")
