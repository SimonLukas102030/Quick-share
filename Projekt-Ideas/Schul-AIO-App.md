# Technisches Pflichtenheft & Architektur-Blueprint

**Projektname:** AIO School Workspace (PWA)  
**Dokumententyp:** Systemarchitektur & Entwicklungs-Spezifikation  
**Version:** 1.0  
**Status:** In Planung  

---

## Inhaltsverzeichnis
1. Projektübersicht & Zielsetzung
2. Systemarchitektur & Infrastructure
3. Sicherheitskonzept & Verschlüsselung
4. Frontend & PWA-Spezifikation
5. Customization & Theme Engine
6. KI-Architektur & Agentic Tool-Calling
7. Drittanbieter- & Dienst-Integrationen
8. Phasenbasierte Entwicklungs-Roadmap

---

## 1. Projektübersicht & Zielsetzung

Das System **AIO School Workspace** ist eine plattformunabhängige, hochgradig anpassbare Progressive Web App (PWA). Sie dient als zentrale Schaltstelle für schularbeitsbezogene Daten, Nachrichten, Dokumente und Stundenpläne.

### Hauptziele:
* **Aggregation:** Zusammenführung isolierter Systeme (WebUntis, Schul.cloud, Nextcloud, E-Mail) in einer einzigen Oberfläche.
* **PWA-Konformität:** Vollständige Lauffähigkeit in restriktiven Umgebungen (z. B. verwaltete Mobilgeräte via Safari / Zum Home-Bildschirm hinzufügen).
* **KI-Orchestrierung:** Einbindung lokaler LLMs (Ollama) oder externer APIs (OpenAI-Kompatibilität) mit Lese- und Schreibzugriff auf das System via Function Calling.
* **Granulare Anpassung:** Vollständige Kontrolle über Layout, Widgets, Themes und sichtbare Funktionen pro Benutzer.

---

## 2. Systemarchitektur & Infrastructure

Die Anwendung basiert auf einer Client-Server-Architektur, aufgeteilt in eine entkoppelte Frontend-PWA und einen modularen Backend-Dienst.

### System-Flussdiagramm
### 
Frontend (PWA / Browser) -> HTML5 / CSS3 (CSS Vars) / JavaScript
       │ (REST API / WebSockets)
       ▼
Backend Engine -> Node.js / Python FastAPI
  ├── Encryption Layer (AES-256-GCM)
  ├── Integrations Modules (WebUntis, Scraper)
  └── AI Orchestrator (Ollama / OpenAI)
       │
       ├── SQLite / Postgres DB
       ├── Nextcloud WebDAV
       └── Ollama / OpenAI API
###

### Komponenten-Aufschlüsselung:
* **Frontend:** PWA-Standard mit Responsive Grid System, Dynamic Theme Engine und iFrame-Embed-Controllern.
* **Backend:** REST-API-Server zur Abwicklung von Datenzugriffen, Scraper-Workflows, WebDAV-Verbindungen und Prompt-Orchestrierung.
* **Datenbank:** Relationale Datenbank (SQLite oder PostgreSQL) zur Speicherung von Benutzer-Einstellungen, Layouts und verschlüsselten Zugangsdaten.

---

## 3. Sicherheitskonzept & Verschlüsselung

Da die Anwendung Zugangsdaten für Drittanbieter-Dienste (WebUntis, Schul.cloud, SMTP) verarbeitet, wird eine strikte Zero-Plaintext-Strategie auf der Datenbank-Ebene angewendet.

### Verschlüsselungs-Workflow (AES-256-GCM)
### 
[ Klartext-Passwort ] -> [ Crypto Module + Master Key + Salt ] -> [ Encrypted Cipher + Auth Tag ] -> Database
###

1. **Master Encryption Key:** Ein zentraler Schlüssel wird ausschließlich als Umgebungsvariable (Environment Variable) auf dem Server gehalten und niemals in die Datenbank geschrieben.
2. **Datenbank-Status:** Alle Passwörter und API-Keys werden vor dem Einfügen in die Datenbank mittels AES-256-GCM verschlüsselt.
3. **Runtime-Entschlüsselung:** Zugangsdaten werden nur im flüchtigen Arbeitsspeicher (RAM) des Backends entschlüsselt, wenn ein Hintergrund-Job (z. B. Stundenplan-Abruf oder Scraper-Session) ausgeführt wird.

---

## 4. Frontend & PWA-Spezifikation

Um auf restriktiven Tablets ohne App-Store-Zugriff zu laufen, erfüllt das Frontend alle Anforderungen einer installierbaren Progressive Web App.

### Essential PWA Files:

#### 1. manifest.json (Konfiguration)
* Steuerdatei für das Verhalten auf dem Home-Bildschirm.
* `"display": "standalone"` entfernt Safari-Navigationsleisten.
* Fixierte Orientierung und App-Icons für hochauflösende Displays.

#### 2. Service Worker (sw.js)
* Fängt Netzwerk-Anfragen ab.
* Speichert Kern-Assets (HTML, CSS, JS, UI-Icons) lokal im Browser-Cache, um sofortige Ladezeiten auch bei schlechtem Schul-WLAN zu garantieren.

---

## 5. Customization & Theme Engine

Das UI-Design ist modular aufgebaut. Der Nutzer kann das visuelle Erscheinungsbild sowie die Anordnung der Steuerelemente festlegen.

### 1. Theme Engine (CSS Custom Properties)
Farben, Radien, Abstände und Schriftarten werden global über CSS-Variablen gesteuert und können zur Laufzeit im Einstellungs-Panel angepasst werden.

| CSS Variable | Standardwert | Beschreibung |
| :--- | :--- | :--- |
| `--bg-main` | `#121212` | Haupt-Hintergrundfarbe |
| `--bg-panel` | `#1e1e1e` | Panel- & Widget-Hintergrund |
| `--accent-color` | `#007acc` | Primäre Akzentfarbe für Buttons/Fokus |
| `--border-radius` | `8px` | Abrundung von Widgets und Eingabefeldern |
| `--font-family` | `Inter, sans-serif` | Systemweit genutzte Schriftart |

### 2. Layout & Layout-Grid (Widget-System)
* Das Dashboard nutzt ein Raster-System (z. B. via Gridstack.js).
* Jedes Element (Schul.cloud Feed, WebUntis-Stundenplan, KI-Chat, Canvas, Quick-Calc) ist ein isoliertes Widget.
* Position (`x`, `y`) und Größe (`width`, `height`) werden im Benutzerprofil als Struktur gespeichert.

---

## 6. KI-Architektur & Agentic Tool-Calling

Die KI dient nicht nur als Text-Chat, sondern als aktiver System-Agent mit Schreib- und Leserechten.

### 1. Modell-Anbindung
* **Flexibler Endpoint:** Der Nutzer hinterlegt entweder die URL einer lokalen Ollama-Instanz oder einen API-Key für OpenAI-kompatible Endpunkte.
* **Modell-Wahl:** Das Backend fragt den `/api/tags`-Endpoint der Ziel-Instanz ab und bietet im Frontend eine Selektion der verfügbaren Modelle an.

### 2. Tool Calling (Function Calling) Protokoll
Die KI erhält beim Initialisieren des Chats eine Liste verfügbarer Werkzeuge als JSON-Schema. Antwortet das Modell mit einem Tool-Call, führt das Backend diesen aus und gibt das Ergebnis an die KI zurück.

### Tool-Execution-Ablauf
### 
User: "Sortiere meine neuen Downloads in die passenden Fach-Ordner."
  │
  ├─► LLM evaluiert Kontext & wählt Werkzeug: organize_directory
  │   JSON Output: { "tool": "move_file", "args": { "source": "/Downloads/Physik.pdf", "target": "/Physik/Hausaufgaben/" } }
  │
  ├─► Backend führt Nextcloud WebDAV Move-Befehl aus.
  │
  └─► LLM erhält Bestätigung & antwortet dem User.
###

#### Verfügbare KI-Tools im System:
1. `organize_directory(source_path)`: Analysiert Dateien im Pfad und verschiebt sie anhand von Betreff/Inhalt in fachspezifische Nextcloud-Ordner.
2. `send_schulcloud_message(channel_id, message)`: Sendet eine Nachricht über den Headless-Scraper in einen bestimmten Channel.
3. `send_email(recipient, subject, body)`: Verschickt E-Mails via SMTP.
4. `read_document_content(file_path)`: Liest den Textinhalt einer Markdown- oder Textdatei zur Verarbeitung ein.
5. `edit_markdown_file(file_path, content)`: Umschreibt oder ergänzt Notiz-Dateien direkt auf dem Server.

### 3. Context Tagging (@-Mentions & RAG)
Tippt der Nutzer im Chat ein @-Zeichen, öffnet sich eine Dateiauswahl. Bei Auswahl einer Datei (z. B. @Mathe_Formeln.md):
1. Das Frontend ruft den Dateiinhalt vom Backend ab.
2. Der Inhalt wird als temporärer System-Kontext in den Prompt eingebettet.
3. Das LLM antwortet mit präzisem Bezug auf das gewählte Dokument.

---

## 7. Drittanbieter- & Dienst-Integrationen

### 1. Nextcloud (Dateien & Office)
* **WebDAV Integration:** Datei-Browsing, Erstellen von Fachordnern und Uploads erfolgen standardisiert über die Nextcloud WebDAV API.
* **Document Editing (.docx, .pptx):** Einbetten der serverseitigen OnlyOffice- oder Collabora-Instanz via HTML-iFrame. Der Nutzer bearbeitet Präsentationen und Textdokumente direkt im Dashboard.
* **Canvas Notizen:** Einbindung des Open-Source Whiteboards Excalidraw. Zeichnungen mit dem Apple Pencil werden vektor basiert als SVG oder Excalidraw-Format gerendert und per Auto-Save via WebDAV im Fachordner abgelegt.

### 2. WebUntis
* **Stundenplan:** Abruf der Stundenplandaten über das JSON-RPC Protokoll der WebUntis-Schnittstelle.
* **Hausaufgaben & Notizen:** Auslesen von Hausaufgaben-Einträgen und Lehrer-Notizen zur Darstellung im Untis-Dashboard-Widget sowie zur Aufbereitung als Aufgabenliste für die KI.

### 3. Schul.cloud
* **Automatisierter Reader/Sender:** Da keine offizielle öffentliche API vorliegt, betreibt das Backend einen isolierten Headless-Browser-Dienst (via Puppeteer oder Playwright).
* **Funktion:** Der Dienst hält eine aktive Session aufrecht, liest ungelesene Nachrichten aus definierten Channels aus und reicht sie via WebSockets an das PWA-Frontend weiter.

---

## 8. Phasenbasierte Entwicklungs-Roadmap

### Roadmap-Übersicht
### 
Phase 1: Foundation ──► Phase 2: Core Integrations ──► Phase 3: AI & Automation ──► Phase 4: Polish
###

### Phase 1: Grundgerüst & PWA Base
* [ ] Erstellen der PWA-Dateien (manifest.json, sw.js).
* [ ] Implementierung der Customization Engine (CSS Variable System + Theme Switcher).
* [ ] Aufbau des variablen Grid-Layouts (Drag-and-Drop Widgets).
* [ ] Aufbau der Datenbank für Benutzereinstellungen und verschlüsselte Secrets (AES-256-GCM).

### Phase 2: Data- & Service-Connectors
* [ ] Implementierung des WebDAV-Clients für Nextcloud (Ordnerstruktur-Generierung).
* [ ] Einbindung des OnlyOffice/Collabora iFrame-Viewers.
* [ ] WebUntis API-Anbindung (Stundenplan- & Hausaufgaben-Sync).
* [ ] Schul.cloud Headless-Scraper zur Extraktion von Channel-Nachrichten.

### Phase 3: KI-System & Tool Execution
* [ ] REST-Client für Ollama und OpenAI-kompatible APIs aufbauen.
* [ ] Entwicklung des @-Mention System-Prompters zur Dokumenteneinbindung.
* [ ] Implementierung des Function-Calling-Executors im Backend.
* [ ] Auto-Sortier-Logik für unstrukturierte Downloads via KI-Klassifizierung.

### Phase 4: Fine-Tuning & Multi-User Support
* [ ] Einbindung von Excalidraw für Apple Pencil Low-Latency Zeichnungen.
* [ ] Multi-User-Verwaltung zur Freigabe des Dashboards an weitere Nutzer.
* [ ] Usability-Optimierung für Touch-Gesten auf iPadOS.
