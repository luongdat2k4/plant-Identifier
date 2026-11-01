# PlantIn recreation

Vue 3 + TypeScript + Capacitor + Tailwind CSS + Iconify Vue implementation based on static analysis of the provided PlantIn 2.70.2 XAPK.

## Run

```powershell
npm install
npm run dev
```

Build web assets with `npm run build`. The native Android project is in `android/`; update it with `npm run android:sync` and build/open it using Android Studio or Gradle.

## Included flows

- My Plants: create, edit, delete, room, notes, photo, watering schedule and mark watered.
- Photo capture or upload for plant/disease/mushroom records and scan history.
- Search saved plants, care reminders, symptom guide, light meter, watering calculator, blog reading screens and settings.
- Data persists locally in browser WebView storage.

The supplied APK does not include the PlantIn backend, catalog or recognition model. Automatic image identification, live expert answers, accounts/sync, billing and push notifications therefore cannot reproduce the original service behavior. The local symptom guide and watering formula are new implementations, not recovered proprietary algorithms. See `../scraping-app/data/feature-analysis.json` for the evidence and feature mapping.
