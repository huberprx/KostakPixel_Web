# Dice & Dots — Website Project Brief

## About the App

**Dice & Dots** is a mobile app (iOS / Android) that lets users create printable dice mosaic designs from their own photos.

### How It Works
1. User selects an image from their gallery, camera, or files.
2. The app converts the image into a mosaic made of dice faces (1–6 dots).
3. User adjusts settings: dice size, color, contrast, paper format, crop.
4. The app generates a print-ready PDF at real-world scale (1:1).
5. User prints the PDF and builds the mosaic with real dice.

### Key Features
- Multiple image sources: photo gallery, camera, files.
- Real-time mosaic preview with Skia rendering.
- Adjustable dice size (8mm mini to 25mm jumbo).
- Multiple dice color schemes (black, white, red, blue, green, yellow, orange, purple, pink, and more).
- Rubik's Cube mode (alternative to dice).
- Paper format presets: A4, A3, A2, A1, A0, B3, B2, B1, B0.
- Custom mosaic dimensions.
- Image crop with multiple aspect ratios.
- Contrast and tone adjustments.
- Blank dice option for extreme light/dark areas.
- Print-ready PDF generation with axis labels and grid coordinates.
- Share PDF via system share sheet.
- Dark and light theme.
- 10 languages: PL, EN, ES, FR, DE, IT, PT, RU, NL, SV.

### Business Model
- **Free to use**: create and preview mosaics for free.
- **Single mosaic export** (consumable IAP): pay per PDF download.
- **Lifetime unlock** (non-consumable IAP): unlimited PDF exports, pay once.
- No ads. No subscriptions.

### Technical
- Built with Expo ~54 / React Native 0.81 / TypeScript.
- Rendering via @shopify/react-native-skia.
- In-app purchases via react-native-iap.
- All image processing is local (on-device). No backend, no accounts, no analytics, no tracking.

---

## Website Requirements

### Purpose
Landing page for Dice & Dots app, including legal documents required by Apple App Store.

### Pages

1. **index.html** — Landing page
   - Hero section with app name, subtitle, icon, and CTA (App Store badge).
   - "How it works" section (3–4 steps with icons/illustrations).
   - Features section (grid of key features).
   - Pricing section (Single export vs Lifetime).
   - FAQ section.
   - Footer with links to Privacy Policy, Terms of Use, and contact email.

2. **privacy.html** — Privacy Policy
   - Full privacy policy (English).
   - See PRIVACY_POLICY.md for content.

3. **terms.html** — Terms of Use
   - Short terms based on Apple Standard EULA.
   - See TERMS_OF_USE.md for content.

### Design
- Modern, clean, premium feel.
- Dark theme preferred (matches app's dark UI: background #0f0f12, accent #ffb020).
- Responsive (mobile-first).
- Static HTML/CSS/JS only (no frameworks, no build step).
- Smooth scroll, subtle animations.
- App icon in hero section.

### Domain & Hosting
- Hosted on GitHub Pages.
- Custom domain will be connected from GoDaddy.
- CNAME file will be added when domain is confirmed.

### Assets Available
- `assets/icon.png` — App icon (1024x1024).
- `assets/favicon.png` — Favicon.

### Colors (from app)
- Background: `#0f0f12`
- Card: `#1a1a22`
- Header: `#14141a`
- Accent: `#ffb020`
- Title text: `#ffffff`
- Subtitle text: `#9a9aaf`
- Muted text: `#8888a0`
- Border: `#2a2a30`

### Fonts
- Quicksand (Google Fonts) — matches the app.

---

## Provider Information (for legal docs)

- **Name:** Hubert Przychodniak
- **Address:** Sarbka 48, 64-705 Czarnków, Poland
- **Email:** szaroczarnytrzmiel@gmail.com

---

## App Store Links (placeholder — update when published)

- Apple App Store: `https://apps.apple.com/app/dice-and-dots/id__________`
- Google Play: (TBD)
