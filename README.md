# 📋 TrackerApp — Frontend

Moderne Kanban-Projekt- und Aufgabenverwaltungs-Webanwendung entwickelt mit **React**, **TypeScript**, **Vite**, **Tailwind CSS** und **Redux Toolkit**.

🌐 **Live-Demo:** [https://dushyna.site](https://dushyna.site)

---

## ✨ Hauptfunktionen

* **Projekt- & Board-Verwaltung**: Erstellen und Bearbeiten von Projekten, Einladen von Teammitgliedern sowie Rollenverwaltung.
* **Interaktives Kanban-Board**: Drag-and-Drop für Spalten (Status) und Aufgabenkarten (`@dnd-kit`), Echtzeit-Suche, Marker-Filterung sowie optimistische UI-Updates mit automatischem Rollback bei Serverfehlern.
* **Aufgabendetails**: Checklisten, Dateianhänge, Kommentare, Fälligkeitsdaten und Prioritäten.
* **Aktivitätsprotokoll (Project Logs)**: Nachvollziehbare Historie aller Projekt- und Aufgabenänderungen.
* **Mehrsprachigkeit (DE / EN)**: Vollständige Lokalisierung der Benutzeroberfläche, Formularvalidierung, Datumsformate und Backend-Fehlermeldungen mit Sprachumschalter im Header.
* **Authentifizierung & Profil**: Registrierung, Login, Passwort-Reset sowie Profil- und Avatar-Verwaltung.

---

## 🛠️ Tech-Stack

* **Core**: React 19, TypeScript, Vite (inkl. Vendor-Chunk-Splitting)
* **State Management**: Redux Toolkit (`combineSlices`, `createAppSlice`)
* **Routing**: React Router
* **Styling**: Tailwind CSS
* **Forms & Validation**: Formik + Yup
* **Internationalisierung (i18n)**: `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `date-fns`
* **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
* **HTTP-Client**: Axios (mit Interceptors & Cookie-basierter Authentifizierung)
* **Testing**: Vitest (Unit-Tests für Error-Mapping & Redux-Slices)

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
   npm run test     # Unit-Tests im Watch-Modus starten
   npm run test:run # Alle Unit-Tests einmalig ausführen
   npm run build    # Production-Build erstellen
   npm run preview  # Production-Build lokal testen
   npm run lint     # Code-Qualität mit ESLint prüfen
   ```

---

## 🔑 Demo-Zugang

Die Anwendung kann direkt über die Live-Demo getestet werden:
* **URL:** [https://dushyna.site](https://dushyna.site)
* **Quick Demo Login / Registrierung:** Über die Login- und Registrierungsseite kann die Anwendung sofort im Demo-Modus oder mit einem eigenen kostenlosen Account getestet werden.

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
* **Optimistische Updates (`tasksSlice.ts`)**: Änderungen an Aufgaben werden sofort in der UI angewendet, über Snapshots (`taskSnapshots`) abgesichert und bei einem Fehler automatisch auf den vorherigen Zustand zurückgesetzt.
* **Typisierte Hooks (`/src/app/hooks.ts`)**: Im gesamten Projekt werden für den Zugriff auf den Store ausschließlich die vordefinierten Hooks `useAppDispatch` und `useAppSelector` verwendet.
---

## 📡 API-Anfragen & Fehlerbehandlung

* **Axios-Instanz (`/src/lib/axiosInstance.ts`)**: Zentrale HTTP-Konfiguration mit Unterstützung für Cookie-basierte Authentifizierung und automatisches Token-Handling.
* **Zentralisiertes Error-Mapping (`/src/utils/apiErrorHandler.ts`)**: Die Hilfsfunktionen `getLocalizedApiError` und `throwLocalizedAxiosError` übersetzen alle Spring-Boot-Backend-Fehlermeldungen (Auth, Security, Mail, Avatar, Project, Collaborator, Task, TaskStatus, Attachment, Comment) sowie HTTP-Statuscodes (z. B. `409 Conflict`) und dynamische Präfixe (`User not found: ...`) zentral über `i18next`. Diese Logik ist in allen fünf Redux-Slices integriert.

---

## ⚡ Performance & Bundle-Optimierung

* **Code-Splitting (`vite.config.ts`)**: Über `build.rollupOptions.output.manualChunks` werden Drittanbieter-Bibliotheken gezielt in dedizierte Vendor-Chunks aufgeteilt (`vendor-react`, `vendor-redux`, `vendor-dnd`, `vendor-i18n`, `vendor-forms`, `vendor-utils`).
* **Ergebnis**: Der Haupt-Chunk `index.js` wurde dadurch von **~728 kB** auf **~188 kB** (~47.8 kB gzip) reduziert, was das Browser-Caching verbessert und die Ladezeiten optimiert.

---

## 🧪 Testing mit Vitest

Das Projekt verfügt über eine automatisierte Unit-Test-Suite (**72 Tests in 6 Testdateien**) auf Basis von **Vitest**:

* **Error-Handler-Tests (`/src/utils/apiErrorHandler.test.ts`)**: Prüfen alle Backend-Fehlermappings, HTTP-Status-Fallbacks, dynamische E-Mail-Präfixe und das Werfen lokalisierter Exceptions.
* **Redux-Slice-Tests (`*.test.ts` neben den jeweiligen Slices)**: Testen initiale Zustände, Selektoren, synchrone Reducer sowie komplette asynchrone Thunk-Zyklen (`pending` -> `fulfilled` -> `rejected` inkl. Rollback bei optimistischen Updates) für `authSlice`, `userSlice`, `projectsSlice`, `taskStatusSlice` und `tasksSlice`.

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
└── utils/        # Hilfsfunktionen & Tests (apiErrorHandler.ts, projectLogFormatter.ts)
```

Aufbau innerhalb jedes Features:

| Ordner / Datei | Zweck                                                     |
|----------------|-----------------------------------------------------------|
| `components/`  | Feature-spezifische UI-Komponenten                        |
| `slice/`       | Redux-Slice + Geschäftslogik + Unit-Tests (`*.test.ts`)   |
| `services/`    | API-Anfragen, die zu diesem Feature gehören               |
| `types/`       | Lokale Typen & DTOs für das jeweilige Feature             |

---

## 🚀 CI/CD & Deployment

* **CI/CD-Pipeline (`/.github/workflows/ci.yml`)**: Bei jedem `push` oder `pull_request` auf `develop` und `main` werden unter Node.js 20 automatisch Abhängigkeiten installiert, der Linter ausgeführt (`npm run lint`), alle Unit-Tests gestartet (`npm run test:run`) und der Production-Build geprüft (`npm run build`). Bei einem Push auf `develop` erfolgt anschließend das automatische Deployment per SSH auf den Ionos VPS.
* **Docker & Nginx (`/Dockerfile`, `/nginx/default.conf`)**: Die Anwendung wird als Container gebaut und über Nginx mit HTTPS-Unterstützung (Let's Encrypt SSL) ausgeliefert.
