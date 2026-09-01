# Entwicklungsplan: Web-Dashboard „simonsstudios.de"
*Stand: konsolidiert nach Rechercherunde 1 — reine Planung, noch kein Code*

## 1. Architektur-Überblick (aktualisiert nach echtem Server-Bestand)

Bestehende Infrastruktur (per `docker ps` bestätigt):
- **Nextcloud AIO** (Mastercontainer-Modell) mit: `nextcloud-aio-nextcloud` (App), `-database` (Postgres), `-redis`, `-apache` (interner Reverse-Proxy, Port 11000), `-collabora` (Office-Bearbeitung/-Konvertierung), `-whiteboard` (Excalidraw-basiert), `-talk`, `-imaginary`, `-notify-push`.
- **cloudflared** — Cloudflare Tunnel, Token-basiert, Routing wird im Cloudflare-Zero-Trust-Dashboard gepflegt (kein lokales `config.yml`-Routing).
- **Portainer**, **Uptime Kuma**, **Netdata** — Monitoring/Verwaltung, optional als Dashboard-Widgets einbindbar.
- Unabhängig laufend (nicht Teil des Projekts, aber Ressourcen-Nachbarn): `twingate`, `lazymc`.
- Aktuelle Hardware: Dell Optiplex, i3, 16 GB DDR3, 512 GB SSD — **wird mittelfristig auf einen Dell PowerEdge migriert** (SSD wird 1:1 umgezogen). Architektur ist bewusst hardwareunabhängig gehalten (alles über Docker-Volumes), damit der Umzug ohne Umbau möglich ist.

```
Internet ──> Cloudflare Tunnel (Public Hostname Routing) ──> Docker-Netz "nextcloud-aio"
                                                                    │
                    ┌───────────────────────────────────────────────────────────────┐
                    │                                                               │
              Nextcloud AIO Stack (bestehend)                          Dashboard-Stack (neu)
              - nextcloud-aio-nextcloud (Identity-Quelle)              - Frontend (Theme-Engine)
              - nextcloud-aio-database (Postgres)                      - Backend API (Auth, Module)
              - nextcloud-aio-collabora (Doku-Bearbeitung)             - Eigene Postgres-DB (App-Daten)
              - nextcloud-aio-redis                                    - Redis (Sessions/Queue)
                                                                        - MCP-Gateway
```

**Wichtige Architekturentscheidung:** Der neue Dashboard-Stack tritt dem bestehenden `nextcloud-aio`-Netzwerk bei, um Nextcloud intern per Container-Namen zu erreichen (WebDAV/OCS-API), statt über den öffentlichen Umweg. Collabora wird als Dokumenten-Engine mitgenutzt statt eines separaten Konvertierungs-Containers — spart Ressourcen auf der noch schwachen Hardware.

---

## 2. Zentrales Login (Nextcloud als Identity-Provider)

- Ziel: **ein Account, ein Passwort**, gültig für Nextcloud und Dashboard.
- Weg: Nextcloud-App **"OpenID Connect Provider"** installieren (aktuell **noch nicht aktiv**, laut Rückmeldung) → Dashboard-Backend authentifiziert sich per OIDC/OAuth2 dagegen.
- Konsequenz: Auth-Modul wird von Anfang an so gebaut, dass **Nextcloud die "Source of Truth"** für Nutzerkonten ist, keine parallele eigene Nutzerverwaltung.

---

## 3. Theme-Switching-Architektur

- Design-Token-System (CSS Custom Properties), Themes als eigene Config-Dateien.
- **Start exklusiv mit Tokyo Night** (praktischerweise auch ein offizielles Omarchy-Theme — passt konzeptionell zusammen).
- **Omarchy-Inspiration:** Die Farbschema-Struktur von Omarchy (`colors.toml`-Prinzip: Background/Foreground/Akzentfarben) dient als Vorbild für unser eigenes Theme-Format. Rein visuelles Theming — die Tastatur-only-Bedienphilosophie von Omarchy betrifft nur das Betriebssystem, nicht unser Touch-optimiertes Web-UI. Zweites Theme (z. B. im Omarchy-"Matte Black"-Stil) ist als spätere Ausbaustufe vorgesehen.
- Theme-Wahl wird pro Nutzer in der DB gespeichert.

---

## 4. Auth- & Berechtigungskonzept

- Gruppen: `schule`, `privat`, `admin` (erweiterbar).
- Feature-Flags pro Gruppe (z. B. IServ/WebUntis nur für `schule` sichtbar).
- 2FA empfohlen (TOTP), da öffentlich über `simonsstudios.de` erreichbar.
- KI-API-Schlüssel verschlüsselt ablegen (nie im Klartext loggen).

---

## 5. Feature-Module — aktueller Realitäts-Stand

| Modul | Ansatz | Status / Einschränkung |
|---|---|---|
| **IServ (Mail)** | IMAP mit eigenem Postfach (Benutzername + App-Passwort) | Kein Admin-Kontakt möglich → **nur IMAP**, keine offizielle REST-API/OAuth2 (die bräuchte Schul-Admin-Setup). Für den Zweck völlig ausreichend. |
| **WebUntis (Stundenplan)** | Primär: inoffizielle JSON-RPC-Schnittstelle (wie von der offiziellen Mobile-App genutzt, community-erprobt z. B. via `webuntis`-Python-Lib), mit eigenem Schüler-Login | Kein iCal-Export freigegeben, kein Admin-Kontakt. Modul wird **austauschbar** gebaut (Interface `TimetableProvider`), damit später eine offizielle Anbindung nachrüstbar ist, falls die Schule das Projekt sieht und freischaltet. |
| **schul.cloud** | Vorerst nur Deep-Link/eingebettete Ansicht (Nutzer loggt sich manuell ein, eigene Session bleibt bestehen) | Keine bekannte offizielle API. Vollautomatischer Zugriff (Credential-Proxy) bewusst **zurückgestellt** — rechtliche Grauzone, hohes Wartungsrisiko, sensible Passwort-Speicherung. Kommt frühestens als klar gekennzeichnetes Opt-in-Feature später. |
| **Dokumenten-Bearbeitung/-Konvertierung** | Nutzung von **Nextcloud Collabora** (bereits vorhanden) statt eigenem Konvertierungs-Service | Ressourcenschonend, nutzt bestehende Infrastruktur. |
| **Handschrift-Editor (GoodNotes-artig)** | Eigener Canvas/SVG-Editor, Pointer Events API (Pressure/Tilt), optimiert für iPad Safari/Chrome/Firefox | Kein Ersatz durch Nextcloud Whiteboard (das ist Vektor/Excalidraw-Stil, kein Pencil-Pressure-Support) — bleibt eigenständiges Modul. |
| **GoodNotes-Backup-Support** | Format ist proprietär und undokumentiert (SQLite-basiert in neueren Versionen) | Erfordert Reverse-Engineering, realistisch nur **Teilkompatibilität** erwartbar. Eigenes Rechercheticket vor Umsetzung. |
| **Wiki** | Eigenbau (Markdown + Postgres) oder Einbettung bestehender Lösung (Wiki.js/BookStack) | Entscheidung noch offen — folgt in späterer Phase. |
| **KI/MCP-Integration** | BYOK für Anthropic, OpenAI, Gemini (Top 3, reines Bring-your-own-key) über generische Provider-Abstraktion (1 Interface, 3 Adapter) | Ressourcenschonend (nur API-Calls). **Lokale KI (Ollama o. ä.) bewusst auf Phase nach PowerEdge-Umzug verschoben**, dann mit Kontingent/Rate-Limit pro Nutzer, um Server nicht durch Missbrauch zu überlasten. |
| **Widget-Dashboard** | Grid-Layout, Widget-Registry-Pattern, Konfiguration als JSONB in DB | Kandidaten für Widgets: eigene Module + optional Portainer/Uptime-Kuma-Status. |
| **"Cardy" — digitales Hofausgangs-Ticket** *(neu, siehe unten)* | Digitales Ticket mit Zeitstempel + QR-Code, vorzeigbar am Sekretariat | Rein privates Tool ohne Schul-Anbindung; siehe Abschnitt 6. |
| **VM-Konzept** | Später: Proxmox/Docker-Dev-Container pro berechtigtem Nutzer, Nextcloud-Verzeichnis gemountet | Bewusst letzte Phase, abhängig von PowerEdge-Kapazität. |

---

## 6. Neues Modul: "Cardy" (digitales Ausgangs-Ticket)

**Ist-Zustand der Schule:** Kein Tor-Kontrollpunkt, sondern ein **fester Ort (Sekretariat)** — Schüler gibt Karte dort ab, holt sie am Ende wieder ab. Das vereinfacht eine technische Lösung erheblich (ein Verifizierungspunkt statt viele).

**Wichtige Einordnung:** Ohne Mitwirkung des Sekretariats bleibt jede Lösung ein **privates digitales Tagebuch ohne Kontrollfunktion** — echte Wirkung entsteht erst, wenn das Sekretariat ein Gegenstück (Tablet/Bildschirm) nutzt, um das digitale Ticket zu verifizieren.

**Geplanter Stufenbau:**
1. **MVP (sofort nutzbar, ohne Schule):** Digitales Ticket mit Zeitstempel + QR-Code zum Vorzeigen — 1:1-digitaler Ersatz der Karte, aber ohne technische Verifikation.
2. **Ausbaustufe (bei Schul-Interesse):** Verifizierungs-Bildschirm fürs Sekretariat (z. B. auf vorhandenem Tablet), der den QR-Code liest/bestätigt/entwertet.
3. Modul wird von Anfang an **sauber gekapselt** gebaut (wie WebUntis), damit Stufe 2 ohne Neubau nachrüstbar ist.

---

## 7. Phasenplan (aktualisiert)

1. **Phase 0 – Setup:** Docker-Compose-Erweiterung (neuer Stack im `nextcloud-aio`-Netz), Cloudflare Public Hostname für Dashboard, CI/CD.
2. **Phase 1 – Fundament:** Auth via Nextcloud-OIDC, leere Dashboard-Shell, Theme-Engine mit Tokyo Night.
3. **Phase 2 – Dateien:** Nextcloud-Anbindung (WebDAV/OCS-API), Collabora-Einbindung für Dokumente.
4. **Phase 3 – Schule (privat nutzbar):** IServ-IMAP, WebUntis (inoffizielle API, austauschbares Interface), "Cardy" MVP.
5. **Phase 4 – Handschrift:** Web-Editor, GoodNotes-Backup-Recherche (Format-Analyse vor Umsetzung).
6. **Phase 5 – Wiki.**
7. **Phase 6 – KI/MCP:** BYOK für Anthropic/OpenAI/Gemini, Provider-Abstraktion, MCP-Gateway.
8. **Phase 7 – Security-Hardening:** 2FA, Audit-Logs, Rate-Limits.
9. **Phase 8 – Nach PowerEdge-Umzug:** Lokale KI (kontingentiert), VM-Konzept, ggf. "Cardy"-Ausbaustufe & offizielle WebUntis-API, falls Schule zustimmt.

---

## 8. Offene Punkte (Stand jetzt)

- [ ] Nextcloud-App "OpenID Connect Provider" installieren/aktivieren.
- [ ] WebUntis: eigenen Login testen, ob inoffizielle API funktioniert.
- [ ] Backend/Frontend-Techstack final festlegen (Vorschlag: NestJS + Next.js, siehe ursprüngliche Stack-Tabelle) — Entscheidung folgt, sobald zur Umsetzung mit Claude Code übergegangen wird.
- [ ] Wiki: Eigenbau vs. bestehende Lösung entscheiden.
- [ ] GoodNotes-Backup-Format: kurze Recherche/Machbarkeitscheck vor Implementierung.

*Hinweis: Dieser Plan wird bewusst nur als Text/Markdown gepflegt — Umsetzung erfolgt gesammelt später via Claude Code, nicht schrittweise in diesem Chat.*
