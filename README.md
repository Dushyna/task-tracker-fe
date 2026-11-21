# 📋 TrackerApp — Frontend

Moderne Kanban-Projekt- und Aufgabenverwaltungs-Webanwendung entwickelt mit **React**, **TypeScript**, **Vite**, **Tailwind CSS** und **Redux Toolkit**.

🌐 **Live-Demo:** [https://dushyna.site](https://dushyna.site)

---

## ✨ Hauptfunktionen

* **Projekt- & Board-Verwaltung**: Erstellen und Bearbeiten von Projekten, Einladen von Teammitgliedern sowie Rollenverwaltung.
* **Interaktives Kanban-Board**: Drag-and-Drop für Spalten (Status) und Aufgabenkarten (`@dnd-kit`), Echtzeit-Suche und Filterung.
* **Aufgabendetails**: Checklisten, Dateianhänge, Kommentare, Fälligkeitsdaten und Prioritäten.
* **Aktivitätsprotokoll (Project Logs)**: Nachvollziehbare Historie aller Projekt- und Aufgabenänderungen.
* **Mehrsprachigkeit (DE / EN)**: Vollständige Lokalisierung der Benutzeroberfläche, Formularvalidierung, Datumsformate und Fehlermeldungen mit Sprachumschalter im Header.
* **Authentifizierung & Profil**: Registrierung, Login, Passwort-Reset sowie Profil- und Avatar-Verwaltung.

---

## 🛠️ Tech-Stack

* **Core**: React 19, TypeScript, Vite
* **State Management**: Redux Toolkit (`combineSlices`, `createAppSlice`)
* **Routing**: React Router
* **Styling**: Tailwind CSS
* **Forms & Validation**: Formik + Yup
* **Internationalisierung (i18n)**: `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `date-fns`
* **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
* **HTTP-Client**: Axios (mit Interceptors & Cookie-basierter Authentifizierung)

---

## 🚀 Lokale Installation & Start

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen konfigurieren** (falls `.env` verwendet wird, z. B. `VITE_API_URL`):
   ```bash
   cp .env.example .env
   ```

3. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```

4. **Weitere Skripte:**
   ```bash
   npm run build    # Production-Build erstellen
   npm run preview  # Production-Build lokal testen
   npm run lint     # Code-Qualität mit ESLint prüfen
   ```

---

## 🔑 Demo-Zugang

Die Anwendung kann direkt über die Live-Demo getestet werden:
* **URL:** [https://dushyna.site](https://dushyna.site)
* **Registrierung:** Ein eigener Account kann jederzeit kostenlos über die Registrierungsseite erstellt werden.
<!-- Optional: Falls du einen festen Demo-Account angeben möchtest, kannst du ihn hier ergänzen:
* **Demo-E-Mail:** `demo@example.com`
* **Demo-Passwort:** `Demo1234!`
-->

---

## 🌍 Internationalisierung (i18n)

Die Anwendung unterstützt **Deutsch (`de`)** und **Englisch (`en`)**:

* **Konfiguration (`/src/i18n/index.ts`)**: Automatische Spracherkennung über den Browser (`i18next-browser-languagedetector`), Speicherung der Auswahl im `localStorage` sowie Synchronisation des HTML-Attributs `document.documentElement.lang`.
* **Übersetzungsdateien (`/src/i18n/locales/de.json`, `en.json`)**: Zentrale Verwaltung sämtlicher UI-Texte, Yup-Validierungsregeln, Project-Log-Formatierungen und API-Fehlermeldungen.
* **Datumsformatierung**: Dynamische Anpassung der `date-fns`-Locales (`de` / `enUS`) entsprechend der gewählten Sprache.

---

## 🧠 State Management mit Redux Toolkit

Für die globale Zustandsverwaltung wird **Redux Toolkit (RTK)** eingesetzt. Die zentrale Konfiguration befindet sich im Ordner `/src/app` und nutzt moderne RTK-Patterns:

* **Store-Setup (`/src/app/store.ts`)**: Neue Slices werden direkt über `combineSlices` zusammengeführt – ein manuelles Registrieren in `combineReducers` ist nicht erforderlich. Die `makeStore`-Factory erleichtert die Wiederverwendung der Store-Konfiguration (z. B. für Tests mit `preloadedState`).
* **`createAppSlice` (`/src/app/createAppSlice.ts`)**: Ermöglicht das Definieren von asynchronen Thunks (`asyncThunkCreator`) direkt innerhalb der Slices.
* **Typisierte Hooks (`/src/app/hooks.ts`)**: Im gesamten Projekt werden für den Zugriff auf den Store ausschließlich die vordefinierten Hooks `useAppDispatch` und `useAppSelector` verwendet.

---

## 📡 API-Anfragen & Fehlerbehandlung

* **Axios-Instanz (`/src/lib/axiosInstance.ts`)**: Zentrale HTTP-Konfiguration mit Unterstützung für Cookie-basierte Authentifizierung und automatisches Token-Handling.
* **Lokalisierte Fehlerbehandlung**: Server- und Netzwerkfehler in den Redux-Slices werden abgefangen und über `i18next` sprachabhängig aufbereitet (siehe z. B. `/src/features/auth/slice/authSlice.ts` und `/src/features/user/slice/userSlice.ts`).

---

## ✅ Weiterleitung (Redirect) nach erfolgreichen Anfragen

Das Registrierungsformular (`RegistrationForm.tsx`) zeigt beispielhaft, wie eine **Weiterleitung** nach einer erfolgreichen Aktion mithilfe von `.unwrap()` umgesetzt wird:

```ts
const handleSubmit = async (values: typeof initialValues) => {
    try {
        await dispatch(
            register({
                email: values.email,
                password: values.password,
            })
        ).unwrap();

        navigate("/login");
    } catch (error) {
        console.error("Registration failed:", error);
    }
};
```

---

## 🗂️ Projektstruktur

```text
src/
├── app/          # Redux-Store (store.ts, createAppSlice.ts), typisierte Hooks & Custom Hooks
├── assets/       # Statische Ressourcen (Bilder, Icons, Schriftarten)
├── components/   # Wiederverwendbare UI-Komponenten (Modals, DynamicForm, etc.)
├── features/     # Fachliche Module (Feature-Sliced-ähnliche Struktur)
│   ├── auth/         # Authentifizierung (Login, Registrierung, Passwort-Reset)
│   ├── projects/     # Projekte, Kanban-Board, Spalten & Project Logs
│   ├── statuses/     # Aufgabenstatus (Task Statuses)
│   ├── tasks/        # Aufgaben, Checklisten, Kommentare & Anhänge
│   └── user/         # Benutzerdaten, Profil & Avatar
├── i18n/         # i18next-Konfiguration & Sprachdateien (de.json, en.json)
├── layouts/      # Übergeordnete Layout-Komponenten (Header, Sprachumschalter, Footer)
├── lib/          # Konfiguration externer Bibliotheken (axiosInstance.ts)
├── pages/        # Seitenkomponenten entsprechend den Routen
├── types/        # Globale TypeScript-Typen & Interfaces
└── utils/        # Allgemeine Hilfsfunktionen (z. B. projectLogFormatter.ts)
```

Aufbau innerhalb jedes Features:

| Ordner / Datei | Zweck                                         |
|----------------|-----------------------------------------------|
| `components/`  | Feature-spezifische UI-Komponenten            |
| `slice/`       | Redux-Slice + Geschäftslogik                  |
| `services/`    | API-Anfragen, die zu diesem Feature gehören   |
| `types/`       | Lokale Typen & DTOs für das jeweilige Feature |

---

## 🚀 CI/CD & Deployment

* **CI/CD-Pipeline (`/.github/workflows/ci.yml`)**: Bei jedem `push` oder `pull_request` auf `develop` und `main` werden automatisch Abhängigkeiten installiert, der Linter ausgeführt (`npm run lint`) und der Production-Build geprüft (`npm run build`). Bei einem Push auf `develop` erfolgt anschließend das automatische Deployment per SSH auf den VPS.
* **Docker & Nginx (`/Dockerfile`, `/nginx/default.conf`)**: Die Anwendung wird als Container gebaut und über Nginx mit HTTPS-Unterstützung (Let's Encrypt SSL) ausgeliefert.
