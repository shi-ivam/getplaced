# getPlaced hackathon deck

This folder contains the 12-slide, 16:9 HTML presentation and its high-resolution exports.

## Present the HTML deck

From the repository root:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/presentation/index.html
```

Controls:

- Right Arrow, Page Down, or Space: next slide
- Left Arrow or Page Up: previous slide
- Home or End: first or last slide
- F: enter or exit browser fullscreen
- Direct slide target: `?slide=6`

## Deliverables

- `index.html`: presentation source, with no animations
- `assets/`: high-resolution screenshots captured from the working app
- `export/slide-01.png` through `export/slide-12.png`: final 2560x1440 slide images
- `getplaced-hackathon-deck.pdf`: 12-page 16:9 PDF export

The deck groups the product into the candidate profile, evidence engine, DSA, resume, interview, company intelligence, academics, progress, career coach, study library, and placement arena stories.
