# FarmSafe Mobile

React Native + Expo port of the original FarmSafe web frontend (`website/frontend/`),
targeting the Node.js/Express/MongoDB API in `server/`.

## Setup

```bash
cd mobile
npm install
cp .env.example .env   # then edit EXPO_PUBLIC_API_BASE_URL
npx expo start
```

`EXPO_PUBLIC_API_BASE_URL` must include the `/api` mount path, e.g.
`http://localhost:5000/api` (the server's own default `PORT` is **5000**,
per `server/.env.example`; the code falls back to `http://localhost:4000/api`
if the env var is unset — set it explicitly to match your running server).
When testing on a physical device via Expo Go, use your machine's LAN IP
instead of `localhost`.

## Screens

1. **Home** — hero + "Get Started" → Login, 3-feature grid.
2. **Login** — email/password → `AuthContext.login`; on success routes to
   `FarmerDashboard` or `AdminDashboard` based on `user.role`.
3. **Register** — name/email/password/role → `AuthContext.register`.
4. **FarmerDashboard** — Header, Hero, StatsCards, FarmerForm (state/crop/
   market/lat/long/language → `POST /api/advisory`), WeatherCard, MarketCard
   + PriceRangeBar, MaxPriceTrendChart (`GET /api/market/history`), CropCard,
   AdvisoryCard (markdown, confidence meter, risk badge, read-aloud, PDF
   share), Footer, FloatingButtons, LoadingScreen.
5. **AdminDashboard** — sync status + "Sync Today's Price" button.

## Key deviations from the original web app

- **Real auth.** The original never persisted a real session or guarded
  routes. This app stores a JWT in `expo-secure-store` via `AuthContext`
  and `RootNavigator` gates navigation: unauthenticated users only see
  Home/Login/Register; once signed in, they're routed straight to the
  role-appropriate dashboard (the original always went to `/farmer`
  regardless of role).
- **Registration stays signed in.** `/api/auth/register` returns a token
  just like login, so after registering the user is kept signed in and
  `RootNavigator` routes them to their dashboard, instead of bouncing back
  to a Login screen as the original did.
- **Latitude/longitude are actually sent.** The original FarmerDashboard
  hardcoded `13.552040,78.505798` when calling the advisory endpoint
  regardless of what was typed into the Lat/Long fields (a bug). This app
  sends whatever the farmer entered, falling back to those same demo
  coordinates only when the fields are left blank.
- **Print vs. PDF.** There's no native "print" distinct from sharing a file
  on mobile, so both the "Download PDF" and "Print" buttons in AdvisoryCard
  invoke the same `expo-print` (generate HTML → PDF) + `expo-sharing` flow;
  the Print button is kept only for UI parity since share sheets also
  expose system print options.
- **`TrendChart.jsx`** was confirmed dead code in the original and was not
  ported. PWA/service-worker config does not apply to Expo and was ignored.
- Web-only APIs were swapped for Expo equivalents: `window.speechSynthesis`
  → `expo-speech` (same language-code map: English→en-IN, Tamil→ta-IN,
  Hindi→hi-IN, Telugu→te-IN), `jspdf` → `expo-print` + `expo-sharing`,
  `window.open`/`tel:` links → `Linking.openURL`.
- Styling uses NativeWind (Tailwind for RN) with the same "green is
  trust-blue, amber is safety-orange" palette from
  `website/frontend/src/index.css`, reproduced in `tailwind.config.js`.
  Web-only utilities (`hover:`, `backdrop-blur`) were dropped or replaced
  with RN-appropriate equivalents (e.g. solid backgrounds instead of
  blur).
- The price trend chart uses `react-native-gifted-charts` instead of
  `recharts` (web-only).

## Verification performed in this (headless, Windows) environment

- `npm install` completed cleanly (1232 packages, exit code 0).
- `npx expo-doctor` — 13/16 checks passed; the 3 failures were either a
  missing `expo-font` peer dependency (fixed by adding it, since
  `@expo/vector-icons` requires it) or required a live connection to the
  Expo API, which this sandbox doesn't have outbound access to.
- `npx expo export --platform android` and `--platform ios` both
  **succeeded**, bundling all 1342 modules with zero syntax/module-resolution
  errors (output bundles ~4.4 MB each, deleted after the check). This caught
  and fixed one real bug along the way: `nativewind/babel` is a Babel
  *preset* (it returns `{plugins: [...]}`, including reanimated's own
  plugin), not a plugin — it was initially miswired into `babel.config.js`'s
  `plugins` array instead of `presets`, which broke the entire bundle until
  corrected.
- Could **not** launch an actual iOS/Android simulator, physical device, or
  Expo Go session — none is available in this environment. A full on-device
  smoke test (navigation between all 5 screens, live calls into the
  `server/` API, the PDF share flow, read-aloud, and the language picker)
  still needs to be done on a real device or simulator with the Node server
  running.
