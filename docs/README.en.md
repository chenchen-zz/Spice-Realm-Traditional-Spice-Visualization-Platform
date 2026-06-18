<div align="center">

# Spice Realm

### Traditional Spice Visualization Platform

Explore the history and cultural value of six traditional Chinese spices through time, geography, and trade flows.

[![Open Live Site](https://img.shields.io/badge/Open_Live_Site-8B5B38?style=for-the-badge&logo=githubpages&logoColor=white)](https://chenchen-zz.github.io/Spice-Realm-Traditional-Spice-Visualization-Platform/)
[![中文](https://img.shields.io/badge/中文-83363A?style=for-the-badge)](../README.md)
[![English](https://img.shields.io/badge/English-436F83?style=for-the-badge)](README.en.md)

![Vue](https://img.shields.io/badge/Vue-3.5-42B883?logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)
![ECharts](https://img.shields.io/badge/ECharts-6.0-AA344D)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222222?logo=github)

</div>

---

## About the Project

**Spice Realm** is an interactive data visualization platform centered on agarwood, sandalwood, ambergris, musk, clove, and patchouli. It turns historical events, production regions, and trade routes into an explorable visual narrative, helping users understand how traditional spices changed across dynasties, regions, and cultural contexts.

### Highlights

- **Historical popularity:** Compare six spices across the Tang, Song, Yuan, Ming, and Qing dynasties with a stacked area chart.
- **Historical context:** Connect changes in popularity with events such as maritime trade administration, sea bans, and the opening of overseas trade.
- **Production map:** Explore modern production regions on an AMap-powered interactive map.
- **Trade flow:** Follow spices from origins through trade routes to their final uses in a Sankey diagram.
- **Responsive interface:** Optimized for desktop and mobile viewing.
- **Continuous deployment:** Every push to `main` is automatically built and published with GitHub Actions.

## Visit the Project

### [Open the live Spice Realm website →](https://chenchen-zz.github.io/Spice-Realm-Traditional-Spice-Visualization-Platform/)

After a new deployment, wait for the GitHub Actions workflow to finish and use `Ctrl + F5` if the browser still shows a cached version.

## Technology

| Category | Technology |
| --- | --- |
| Framework | Vue 3 |
| Build tool | Vite |
| Visualization | Apache ECharts |
| Maps | AMap JavaScript API 2.0 |
| Routing | Vue Router |
| Deployment | GitHub Actions + GitHub Pages |

## Project Structure

```text
.
├─ .github/workflows/deploy.yml  # GitHub Pages deployment
├─ docs/README.en.md             # English documentation
├─ public/data/                  # Runtime JSON datasets
├─ src/
│  ├─ assets/
│  │  ├─ images/                 # Page artwork
│  │  └─ videos/                 # Web-optimized background video
│  ├─ data/events/               # Historical event data
│  ├─ router/                    # Router configuration
│  ├─ views/sections/            # Home, time, space, and flow sections
│  ├─ App.vue
│  └─ main.js
├─ .env.example
├─ package.json
└─ vite.config.js
```

## Run Locally

### Requirements

- Node.js 20 or newer
- npm
- An AMap key created for the **Web JavaScript API**

### Clone and install

```bash
git clone git@github.com:chenchen-zz/Spice-Realm-Traditional-Spice-Visualization-Platform.git
cd Spice-Realm-Traditional-Spice-Visualization-Platform
npm install
```

HTTPS is also supported:

```bash
git clone https://github.com/chenchen-zz/Spice-Realm-Traditional-Spice-Visualization-Platform.git
```

### Configure AMap

Copy the environment template:

```powershell
Copy-Item .env.example .env.local
```

On macOS or Linux:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_AMAP_KEY=your_web_js_api_key
VITE_AMAP_SECURITY_CODE=your_security_js_code
```

For production deployment, add your own GitHub Pages domain to the AMap allowlist:

```text
<your-github-username>.github.io
```

For example, this project is owned by `chenchen-zz`, so the original deployment uses
`chenchen-zz.github.io`. If your username is `example-user`, enter
`example-user.github.io`. Normally, only the domain is required, without the repository path.

The AMap console may reject `localhost` and `127.0.0.1` as invalid domains. If local
development produces an `INVALID_USER_DOMAIN` error, temporarily disable the domain
allowlist as described in the
[official AMap guidance](https://lbs.amap.com/faq/js-api/map-js-api/create-project/46515).
Restore the production domain after local testing.

> `.env.local` is ignored by Git. Never commit real credentials.

### Start development

```bash
npm run dev
```

The local URL is usually:

```text
http://localhost:5173/Spice-Realm-Traditional-Spice-Visualization-Platform/
```

### Build and preview

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`, which should not be committed.

## Deploy Your Own Copy

1. Fork or copy this repository.
2. If you use a different repository name, update the `base` option in `vite.config.js`:

   ```js
   base: '/your-repository-name/',
   ```

3. Open `Settings → Secrets and variables → Actions` and add:

   ```text
   VITE_AMAP_KEY
   VITE_AMAP_SECURITY_CODE
   ```

4. Open `Settings → Pages` and select `GitHub Actions` as the publishing source.
5. Push to `main`.
6. Wait for the `Deploy to GitHub Pages` workflow to complete.

## Data and Security

- Data under `public/data/` is publicly available as part of the static website.
- Vite client-side environment variables are embedded into the browser bundle, so the AMap domain allowlist is essential.
- Do not commit `.env.local`, `node_modules/`, or `dist/`.
- The hero video is compressed and prepared with MP4 Fast Start for reliable web playback.

## Commands

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build
```

## License

This project is intended for data visualization study and demonstration. Verify the license of individual datasets, images, and written materials before reusing them.

<div align="center">

Revisiting the history of fragrance through data.

</div>
