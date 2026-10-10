# Ferro & Sons Barbers — site concept

Static one-page site: `index.html`, `styles.css`, `main.js`, `sitemenu.js` / `sitemenu.css` (mobile drawer), `fonts/` (self-hosted, OFL).
No build step, no forms, no backend. Works on GitHub Pages from any sub-path.

## Replacing demo content with the real shop's details

Everything below is fictional placeholder content and must be confirmed with the owner.

| What | Where |
|---|---|
| Hours | **Two places:** the `<table class="hours">` in `index.html` (what people read, works without JS) and `window.SHOP.hours` at the bottom of `index.html` (minutes after midnight, drives "Open now", the dock and the menu). Also the JSON-LD block in `<head>` and `SITEMENU.info`. |
| Typical waits | `window.SHOP.waits`, by day (2 = Tue … 6 = Sat) and hour. Shop's own estimates, labelled "not live" on the page. |
| Barbers & their days | `.chair` items. `data-days` = days they work (0 = Sun), `data-when` = "mornings" / "afternoons" / "all day", optional `data-sat` override for Saturday. |
| Prices | `.board__list` in `index.html` and the shave price line in `.shave__price`. |
| Phone, email, address, transit | Search `index.html` for `555-0171`, `ferroandsons.com`, `6812`. |
| Photos | Currently hot-linked Unsplash stock (not the real shop). Replace with the shop's own photos; keep the `width`/`height` attributes and alt text accurate. The hero uses a separate portrait crop for phones (`<source media="(max-width: 599px)">`). |

## Notes
- Fonts load only over http(s). Opening `index.html` straight from disk (file://) shows fallback fonts; GitHub Pages or any local server is fine.
- "Open now" and "In today" use New York time, whatever the visitor's time zone.
