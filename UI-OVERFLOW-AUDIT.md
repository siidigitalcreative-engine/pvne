# UI overflow audit update

This pass adds containment rules for direct children of the header, hero search, dashboard rows, category tiles, business cards, and map promotion. It also ensures mobile dashboard and discovery sections use one column below 700px and business cards use one column below 420px.

## Verification status
- CSS rules reviewed for mobile grid/flex containment and text wrapping.
- Production build: not verified in this environment.
- Automated browser viewport/overflow audit: not run.
- Therefore this update is not certified as 100% bug-free; final confirmation requires running the project and checking real rendered pages at 320px, 375px, 390px, 430px, tablet, and desktop widths.
