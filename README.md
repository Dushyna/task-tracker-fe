## 🚀 React + TypeScript + Vite

Vergiss nicht, vor dem Start die Abhängigkeiten zu installieren:

```bash
npm install
```

---

### 🎨 Styling mit Tailwind CSS

Das Projekt ist bereits für die Verwendung von **Tailwind CSS** vorkonfiguriert.
Es empfiehlt sich, etwas Zeit in das Kennenlernen der Syntax zu investieren, um die Benutzeroberfläche einfach und effizient zu gestalten.

* Dokumentation: [https://tailwindcss.com](https://tailwindcss.com)

---

### 🧠 State Management mit Redux Toolkit

Für die globale Zustandsverwaltung wird **Redux Toolkit (RTK)** eingesetzt. Die zentrale Konfiguration befindet sich im Ordner `/src/app` und nutzt moderne RTK-Patterns:

* **Store-Setup (`/src/app/store.ts`)**: Neue Slices werden direkt über `combineSlices` zusammengeführt – ein manuelles Registrieren in `combineReducers` ist nicht erforderlich. Die `makeStore`-Factory erleichtert die Wiederverwendung der Store-Konfiguration (z. B. für Tests mit `preloadedState`).
* **`createAppSlice` (`/src/app/createAppSlice.ts`)**: Ermöglicht das Definieren von asynchronen Thunks (`asyncThunkCreator`) direkt innerhalb der Slices.
* **Typisierte Hooks (`/src/app/hooks.ts`)**: Im gesamten Projekt werden für den Zugriff auf den Store ausschließlich die vordefinierten Hooks `useAppDispatch` und `useAppSelector` verwendet.

---

### 📡 API-Anfragen mit Axios

Für das Senden von HTTP-Anfragen wird **Axios** verwendet.
Die globale Konfiguration ist bereits eingerichtet und befindet sich unter:

```
/src/lib/axiosInstance.ts
```

✅ Unterstützung für Cookie-basierte Authentifizierung.

---

### ⚠️ Fehlerbehandlung

Ein Beispiel für die Behandlung von Serverfehlern und Axios-Exceptions befindet sich im **authSlice** (`/src/features/auth/slice/authSlice.ts`).

---

### ✅ Weiterleitung (Redirect) nach erfolgreichen Anfragen

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

### 🗂️ Projektstruktur

#### 📁 `/app`

Enthält die **Redux-Store-Konfiguration** (`store.ts`, `createAppSlice.ts`), typisierte RTK-Hooks (`hooks.ts`) sowie globale Custom Hooks (`customHooks/`).

#### 📁 `/assets`

Enthält statische Ressourcen wie Bilder, Icons und Schriftarten.

#### 📁 `/layouts`

Beinhaltet übergeordnete **Layout-Komponenten** (z. B. `Layout.tsx`), die den gemeinsamen Rahmen für verschiedene Seiten bilden.

#### 📁 `/pages`

Enthält die **Seiten der Anwendung**, die den jeweiligen Routen (Routes) entsprechen.

#### 📁 `/components`

Hier liegen **wiederverwendbare UI-Komponenten** und allgemeine visuelle Bausteine, die nicht direkt an bestimmte Features gebunden sind.

#### 📁 `/features`

Jedes Feature ist ein **logisch isolierter Bereich der Anwendung**:

```
features/
  auth/         # Authentifizierung
  projects/     # Projekte
  statuses/     # Aufgabenstatus (Task Statuses)
  tasks/        # Aufgaben (Tasks)
  user/         # Benutzerdaten & Profil
```

Aufbau innerhalb jedes Features:

| Ordner / Datei | Zweck                                         |
|----------------|-----------------------------------------------|
| `slice/`       | Redux-Slice + Geschäftslogik                  |
| `services/`    | API-Anfragen, die zu diesem Feature gehören   |
| `types/`       | Lokale Typen & DTOs für das jeweilige Feature |

#### 📁 `/lib` & `/utils`

* **`/lib`**: Konfiguration externer Bibliotheken (z. B. `axiosInstance.ts`).
* **`/utils`**: Allgemeine Hilfsfunktionen (Helper), die projektweit genutzt werden.

#### 📁 `/types`

Globale Typen, die in der gesamten Anwendung genutzt werden (z. B. `User`, `Tokens`, `ApiError` usw.).

---

### 🚀 CI/CD & Deployment

* **CI/CD-Pipeline (`/.github/workflows/ci.yml`)**: Bei jedem `push` oder `pull_request` auf `develop` und `main` werden automatisch Abhängigkeiten installiert, der Linter ausgeführt (`npm run lint`) und der Production-Build geprüft (`npm run build`). Bei einem Push auf `develop` erfolgt anschließend das automatische Deployment per SSH auf den VPS.
* **Docker & Nginx (`/Dockerfile`, `/nginx/default.conf`)**: Die Anwendung wird als Container gebaut und über Nginx mit HTTPS-Unterstützung (Let's Encrypt SSL) ausgeliefert.
* **Live-Demo**: [https://dushyna.site](https://dushyna.site)

---
