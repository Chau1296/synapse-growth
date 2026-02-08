# Gold Pulse

A static web app to visualize gold prices with an interactive chart and quick summary metrics.

## Features

- Live fetch of daily gold futures data (USD/oz)
- Time-range selector (1M, 3M, 6M, 1Y, 3Y, 5Y)
- Key metrics: latest price, day-over-day move, range high, range low
- GitHub Pages deployment via GitHub Actions

## Local run

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Data source

- Stooq Gold Futures CSV: [https://stooq.com/q/d/l/?s=gc.f&i=d](https://stooq.com/q/d/l/?s=gc.f&i=d)

## Deploy

Push to `main`. The included workflow in `.github/workflows/deploy-pages.yml` publishes `public/` to GitHub Pages.
