# NYC Storefronts: website concepts

43 working, static websites for New York neighborhood businesses. Open `index.html` to see the showcase: filter by type (pharmacies, coffee, bakeries, restaurants, barbers, juice bars), search by name or neighborhood, and preview any site at phone or desktop size without leaving the page.

- **Pharmacies (21 sites):** Hartley, Farmacia Luz, Northline, Verbena, Bellcrest, Bond Street, Concourse, Ditmars Terminal, Durán & Hossain (2 directions), Halvorsen, Harborview, Hollowell, La Cumbre, Loreto, Meridian, Mott Street, Mount Morris, Riverside Formulary, Seventh Avenue, Wyckoff
- **Coffee (7):** Stoop, The Conservatory, Halsey Hi-Fi, Mokha & Moon, Orchard Street Roasting, Overpass, Second Shift
- **Bakeries (6):** Dobra, Feldman & Daughters, Kowal & Daughter (2 directions), Maison Odile, Ninebark
- **Restaurants (3), barbers (3), juice bars (3)**

Link straight to a category with `index.html#pharmacy`, `#coffee`, `#bakery`, `#restaurant`, `#barber` or `#juice`. The old `index-new.html` and `index-pharmacies.html` now redirect to the main showcase; the previous index pages are kept in `archive/old-index/`.

## Publish on GitHub Pages
1. Create a repository and upload the *contents* of this folder (so `index.html` is at the root).
2. Go to Settings → Pages → Deploy from a branch → `main` / root.
3. Your link will be `https://<username>.github.io/<repo>/`.

Everything uses relative paths, plain HTML, CSS and JavaScript. There is no build step. `.nojekyll` is included.

## Showcase files
- `showcase/showcase.css`, `showcase/showcase.js`, `showcase/fonts/` — the index page's own styles and behavior.
- `showcase/thumbs/` — desktop and phone screenshots for each card. Sites built around stock photos show a live, scaled-down preview of the site instead, so their photos appear exactly as on the real site.

All businesses, people, addresses and phone numbers are fictional. Some sites hot-link stock photos from Unsplash as stand-ins for each owner's own photography.
