# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A data-driven React portfolio template (by Ryan Balieiro) built with Vite, React 18, Bootstrap 5, and SCSS. Content is authored as JSON under `public/data/` — almost no source-code editing is needed for normal customization. Code edits are only required when adding new article component types.

A complete customization guide lives in `docs/tutorials/TUTORIAL_01..22_*.md`. Consult the relevant tutorial before changing JSON schemas or component contracts.

## Commands

- `npm run dev` — start Vite dev server.
- `npm run build` — production build (Vite, base path `/react-portfolio-template/` — see `vite.config.js`).
- `npm run preview` — preview the production build.
- `npm run lint` — ESLint over the project.
- `npm run resume:clear` — wipe template content (deletes `public/images/pictures`, empties `public/audio` and `public/data/sections`, overwrites `settings.json` to a blank state). Destructive — confirm with the user first.
- `npm run resume:make:article ArticleFoo` — scaffold a new article type. See "Adding a new Article" below.

There is no test runner configured.

## Architecture

### Data-driven content pipeline

All portfolio content is JSON loaded at runtime from `public/data/`:

- `settings.json` — global template settings (themes, languages, preloader, developer flags, etc.). Loaded first by `src/main.jsx` before anything else renders.
- `profile.json` — author profile.
- `strings.json` — i18n strings.
- `categories.json` — top-level groupings (mobile tabs).
- `sections.json` — array of sections, each with `id`, `categoryId`, `jsonPath`, `faIcon`. `jsonPath` points at a per-section file in `public/data/sections/` (e.g. `experience.json`, `portfolio.json`).
- `public/data/sections/*.json` — each section contains an `articles` array. Every article has `id`, `component` (the JSX component name, e.g. `ArticleSkills`), `locales`, `settings`, `items`.

**Invariant:** every section's `categoryId` must match a category in `categories.json`, and every category must own at least one section, or the app throws.

### Boot flow (`src/main.jsx`)

`AppEssentialsWrapper` loads `settings.json`, applies developer flags (debug mode, fake email, preloader-lock — all bypassed in production), then mounts `DataProvider` (which loads the remaining JSON). Once data is ready, `AppCapabilitiesWrapper` mounts the provider stack in this order:

`LanguageProvider → ViewportProvider → InputProvider → FeedbacksProvider → ThemeProvider → LocationProvider → NavigationProvider → Portfolio`

Anything that needs theme/language/navigation reads from these via `useData()`, `useLanguage()`, `useTheme()`, `useLocation()`, `useNavigation()`.

### Article system

The render pipeline for a section:

1. `Section` → `SectionBody` calls `useParser().parseSectionArticles(section)` which returns an array of `ArticleDataWrapper` instances (`src/hooks/models/ArticleDataWrapper.js`). The wrapper resolves locales for the current language, parses `settings`, and produces `ArticleItemDataWrapper` instances for each `items[]` entry.
2. `SectionBody.ARTICLES` is a static map of component-name → component. The parser-resolved `component` string is looked up in this map; unknown names fall back to `ArticleNotFound`.
3. Each article component receives `{ dataWrapper, id }` and reads strongly-typed fields off the wrapper (`dataWrapper.locales.title`, `dataWrapper.getOrderedItemsFilteredBy(...)`, etc.).

**To add custom article-level settings or item fields**, extend `_parseSettings()` in `ArticleDataWrapper.js` or the parsing in `ArticleItemDataWrapper.js` — JSON fields not parsed there will not be available to components.

### Adding a new Article type

Run `npm run resume:make:article Article<Name>` (name MUST start with `Article`). The script (`npm/npm-resume-new-article.js`):

1. Creates `src/components/articles/Article<Name>.jsx` and `.scss` from `npm/templates/article-component-builder.js`.
2. **Auto-edits `src/components/sections/SectionBody.jsx`** to add the import and register the component in `SectionBody.ARTICLES`. If you ever rename or hand-add an article, this map must stay in sync or `ArticleNotFound` is rendered instead.

See `docs/tutorials/TUTORIAL_22_BONUS_CREATING_YOUR_OWN_CUSTOM_ARTICLE.md` for the full pattern.

### Styling

- SCSS lives in `src/styles/` (entry `app.scss`). Themes in `themes/`, layout in `layout/`, design tokens in `_constants.scss`, theme-customization knobs in `customization/`.
- Components co-locate their own `.scss` next to the `.jsx`.
- Vite is configured to silence several SCSS deprecation warnings (`mixed-decls`, `color-functions`, `global-builtin`, `import`) — don't try to "fix" these as build errors.

### Build / deploy notes

- `vite.config.js` sets `base: '/react-portfolio-template/'` for GitHub Pages deployment. If forking/deploying under a different path, this must be updated (see `TUTORIAL_21`).
- Swiper is split into its own chunk via `manualChunks` to keep the main bundle small.
- Email delivery uses EmailJS in the browser — no backend.

## Conventions worth knowing

- New article components must follow the `Article<Name>` naming convention; the scaffolder rejects anything else.
- Article JSON `locales` are keyed by language id (`en`, etc.) matching `supportedLanguages` in `settings.json`.
- `dangerouslySetInnerHTML` is used heavily for locale strings so `{{highlight}}` / `[[link]]` markers in JSON can render as styled spans — preserve this when writing new article components.
