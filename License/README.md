# Flask City Weather App

A minimal Flask application that lets users enter a city and displays current weather with an icon, temperature, feels-like, humidity, and wind.

## Quick Start (macOS)

1. (Optional) Create `.env` from example to customize settings. No API key is required by default (Open‑Meteo provider):

```
cp .env.example .env
# Optionally set WEATHER_PROVIDER=openweathermap and OWM_API_KEY if you prefer OWM
```

1. Create a virtual environment and install dependencies:

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

1. Run the app (Flask dev server):

```
export FLASK_APP=weather_app.app
flask --app weather_app.app --debug run
```

Open <http://127.0.0.1:5000> and search for a city.

## Tests

```
pip install -r requirements.txt
pytest -q
```

## Environment Variables

- `WEATHER_PROVIDER` (optional): `open-meteo` (default, no key) or `openweathermap`.
- `OWM_API_KEY` (optional): Only needed if using `openweathermap`.
- `CACHE_DEFAULT_TIMEOUT` (optional): cache TTL in seconds (default 300)
- `RATELIMIT_DEFAULT` (optional): default rate limit (default "60 per minute")
- `REQUEST_TIMEOUT` (optional): HTTP timeout in seconds (default 5.0)
- `REQUEST_RETRIES` (optional): number of retries for transient errors (default 2)

## Notes

- Icons: For Open‑Meteo, local SVG icons are used and mapped from weather codes; for OWM, icons load from OWM's CDN.
- For production, use Gunicorn (e.g., `gunicorn 'weather_app.app:create_app()'`) behind Nginx, add Redis for caching, and configure environment variables via your hosting platform.
