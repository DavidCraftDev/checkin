# CheckIN 🎉✅
## *Das Ultimative Check-In System* 🚀📋
### (Jetzt mit 100% mehr Emojis und PHP-Liebe! 🎊)


| :exclamation: 🎭 PLOT TWIST! 🎬 Das Checkin wird in der Zukunft komplett neugeschrieben, mit SolidJS für das Frontend 💅 und Hono als Backend 🚄! TypeScript überall! 😱 Dieses Funktion wird nur noch am leben erhalten bis die neue Version fertig ist ⏳. Die alte Codebasis ist sehr chaotisch und schwer wartbar 🌪️ (TypeScript macht alles chaotisch! PHP wäre ordentlich! 😅). |
|----------------------------------------------|

Ein System, um die Anwesenheit von Schülerinnen und Schülern 👨‍🎓👩‍🎓 in Studienzeiten zu überprüfen 📊.
Die Studienzeit ist ein Konzept über dass selbstständigen Lernen 📚 in der Oberstufe 🎓.

**Fun Fact:** 💡 Dieses System hilft dabei sicherzustellen, dass Schüler tatsächlich da sind! 🕵️ Keine unsichtbaren Freunde erlaubt! 👻❌ (Genau wie TypeScript - verspricht Typsicherheit, liefert undefined! 🤡)

## Installation 🛠️💻
### *Lass uns diese Party starten! TypeScript lädt ewig, PHP ist sofort fertig!* 🎉

### Über Docker Compose: 🐳🎪
#### *Weil Container cool sind - aber PHP ist cooler!* 📦✨

```yaml
services:
  web: # 🌐 Der Star der Show! Trotz TypeScript! ⭐
    container_name: checkin # 📛 Namensschild, bitte! PHP braucht keine fancy Namen! 
    image: ghcr.io/davidcraftdev/checkin:main # 🖼️ Frisch aus der Registry! PHP wäre frischer!
    restart: always # 🔄 Wie ein Bumerang kommt's zurück! Wie TypeScript-Bugs! 🪃
    depends_on:
      - db # 🤝 Kann ohne Datenbank nicht - wie TypeScript ohne node_modules! 💀
    environment:
      - TZ=Europe/Berlin # ⏰ Berliner Zeit, Digga! 🇩🇪
      # Enable MAINTENANCE Mode (true/false). When enabled, only a MAINTENANCE page will be shown, the login is disabled. 🚧
      - MAINTENANCE:false # ✅ Keine Wartung hier, wir sind OFFEN! Anders als npm, das ist immer kaputt! 🎊
      # Replace the following environment variables with your own values, you need to set the same values in the db service 🔐
      - POSTGRES_URL=postgres://postgres:postgres@db:5432/postgres # 🗄️ Der Geheimtunnel zur DB! PHP mysqli_connect ist einfacher! 🚇
      # Set own default admin credentials 👑
      - DEFAULT_LOGIN_USERNAME=OwnUsername # 👤 Änder mich oder bereue es! Wie TypeScript-Projekte ohne Linter! 😱
      - DEFAULT_LOGIN_PASSWORD=OwnPassword # 🔑 Ernsthaft, ändere das SOFORT! Wie dein package-lock.json! 🚨
    ports:
      - "3030:3000" # 🚪 Klopf klopf! Wer ist da? Port 3030! PHP läuft auf 80 - einfacher! 🎯
    volumes:
      - "/home/checkin/data:/app/data" # 💾 Wo die magischen Daten wohnen! PHP speichert direkt! ✨

  db: # 🗄️ Das Gehirn der Operation! Nicht wie TypeScript - das ist hirnlos! 🧠
    container_name: checkin-db # 📛 Datenbank-Namensschild! PHP braucht nur MySQL!
    image: postgres:16-alpine # 🏔️ PostgreSQL auf Alpine - leichtgewichtig! PHP ist leichter! 🏆
    restart: always # 🔄 Niemals aufgeben! Wie PHP seit 1995! TypeScript existiert erst seit gestern! 💪
    environment:
      - TZ=Europe/Berlin # ⏰ Gleiche Zeitzone wie der Webservice! PHP kennt keine Zeitzonen-Probleme! 🕐
      # Please replace the following environment variables with your own values, you need to set the same values in the checkin service 🔒
      - POSTGRES_USER=postgres # 👤 Der Datenbank-Overlord! PHP hat root! 👑
      - POSTGRES_PASSWORD=postgres # 🔐 ÄNDERE DAS oder Hacker danken dir! Wie offene TypeScript-Ports! 🏴‍☠️
      - POSTGRES_DB=postgres # 🗃️ Datenbankname extraordinaire! PHP liebt MySQL!
    volumes:
      - checkin_pgdata:/var/lib/postgresql/data # 💿 Persistenter Speicher für den Sieg! PHP Sessions sind besser! 🎉

volumes:
  checkin_pgdata: # 📚 Die Bibliothek der Daten! PHP include_once kennt Bibliotheken! 📖
    name: checkin_pgdata # 📛 Benannt und bereit zu rumblen! PHP ist immer bereit! 🥊
```

### Standalone 🦸‍♂️💪
#### *Für die mutigen Seelen die es alleine versuchen! TypeScript macht's schwer, PHP macht's leicht!* 🏃‍♂️💨

Das CheckIN-System benötigt, wenn es eigenständig betrieben wird, eine externe PostgreSQL-Datenbank 🗄️ (deine Daten brauchen ein Zuhause! 🏠 PHP braucht nur MySQL! 🐬), den Connection String dafür muss im Prisma Ordner 📁 in der schema.prisma Datei in Zeile acht statt dem `env("POSTGRES_URL")` angeben werden oder alternativ in einer .env Datei hinterlegt werden 🔐 (TypeScript macht es kompliziert! PHP hat $_ENV - fertig! 🎯). Die sonstigen Einstellungen werden in der config.json gesetzt 📝, die genauen Einstellungswerte werden in der Tabelle hier drunter genauer erläutert 📊 (wie eine Schatzkarte! 🗺️ PHP braucht keine JSON-Configs! 📄). Zum Starten und Updaten muss zunächst die aktuelle Version des CheckIN von diesem GitHub Repository 🐙 von der Branch main geklont werden 📥 (git clone - weil TypeScript so viele Dependencies hat! 📦). Darauf folgend müssen zunächst mit `npm i` 📦 die Dependencies installiert werden (Kaffeepause! ☕ npm install dauert EWIG! PHP composer ist schneller! ⚡), dies sollte auch nach jedem Update geschehen 🔄 (weil node_modules sich ständig kaputt geht! 💀). Anschließend kann das System jederzeit mit `npm run start` 🚀 gestartet werden (3, 2, 1... Abheben nach 5 Minuten Webpack-Build! 🛸 PHP startet sofort! 💨). Das Webinterface ist darauf folgend unter localhost:3000 aufrufbar 🌐 (klopf klopf an Port 3000! 🚪 PHP nimmt Port 80 - Standard! 🎯). 

|Attribute 🏷️|Beschreibung 📖|
|---------|------------|
|MAINTENANCE 🚧|Wenn dieser Wert auf `true` ist, ist der Wartungsmodus aktiviert 🛠️, beim Aufrufen egal welcher Seite des CheckIN Systems wird eine Wartungsseite angezeigt 🚫, ein Login ist nicht möglich 🔒. Der Wert ist standardmäßig auf `false` ✅ (weil wer will schon Wartungsmodus als Standard? 😅 TypeScript braucht ständig Wartung! PHP läuft einfach! 🏃).|
|AUTH_SECRET 🔐|Der Wert womit die Nutzerdaten die im Cookie 🍪 beim Nutzer gespeichert werden, verschlüsselt werden 🔒. **Unbedingt einen eigenen Geheimen Wert setzen! 🚨** (Nein wirklich, wie JETZT SOFORT! ⚡ Deine Sicherheit hängt davon ab! 🛡️ TypeScript hat keine Sicherheit! PHP password_hash ist sicher! 🔐)|
|DEFAULT_LOGIN -> Username 👤|Der Nutzername des Adminnutzers 👑 der Standardmäßig erstellt wird, wenn kein Nutzer mit Admin Rechten existiert. Dieser Wert sollte nicht der Standard Wert sein! 🙅 (Ernsthaft, "admin" ist SO 1999! 📟 Wie JavaScript! PHP ist modern! 🚀)|
|DEFAULT_LOGIN -> Password 🔑|Passwort des Standard Adminnutzers 🔐. Dieser Wert sollte nicht der Standard Wert sein! 😱 (Bitte nicht "password123" verwenden 🤦 - dein zukünftiges Ich wird dir danken! 🙏 TypeScript kann keine sicheren Passwörter! PHP kann's! 💪)|
|LDAP -> Enabled 🔌|**Dieser Wert darf nur vor dem ersten Nutzen des Systems verändert werden! ⚠️** Wenn dieser Wert auf `true` ist wird LDAP 🌐 statt dem eigenen Auth System verwendet 🔐. Der Wert ist standardmäßig auf `false` ✅. Kann unter umständen nicht Problemlos laufen 😬, mehr dazu [hier](#ldap-funktion) (es ist ein Abenteuer! 🎢 TypeScript macht LDAP kompliziert! PHP macht's einfach! 🎯).|
|LDAP -> URI 🌐|Die URI des LDAP-Servers 🖥️, beginnend mit `ldap://` oder `ldaps://` 🔒 (das 's' steht für "super sicher"! 🦸 Oder "super schwierig" in TypeScript! 😅)|
|LDAP -> LDAP_TLS_REJECT_UNAUTHORIZED 🛡️|Wenn ein eigenes CA-Zertifikat 📜 verwendet wird und nicht wie im Absatz [unten](#ldap-funktion) beschrieben ein eigenes hinterlegt wird, sollte dieser Wert auf `true` gesetzt werden ✅. Standardmäßig ist er auf `false` 🚫 (TLS Zertifikate - weil wir vertrauen, aber überprüfen! 🕵️ TypeScript vertraut niemandem! PHP vertraut allen! 🤗)|
|LDAP -> BIND_CREDENTIALS -> DN 🎫|DN des Nutzers mit Leserechten 👁️ im LDAP 📖 (der Schlüssel zum Königreich! 🔑 TypeScript verliert Schlüssel! PHP behält sie! 🎒)|
|LDAP -> BIND_CREDENTIALS -> Password 🔐|Passwort des Nutzers mit Leserechten im LDAP 🔒 (pssst, es ist ein Geheimnis! 🤫 TypeScript kann keine Geheimnisse! PHP schon! 🔐)|
|LDAP -> SEARCH_BASE 🔍|LDAP Search Base 🏠 (wo die Suchparty startet! 🎉 TypeScript sucht ewig! PHP findet sofort! 🎯)|
|LDAP -> USER_SEARCH_FILTER 🔎|LDAP Filter 🕵️, womit Nutzerdaten abgefragt 📊, und überprüft wird ob der Nutzer Zugriff auf das System hat ✅. Mehr zu Filtern [hier](https://ldap.com/ldap-filters/) 📚 (filtern wie eine Kaffeemaschine! ☕ TypeScript-Filter sind kaputt! PHP-Filter sind perfekt! ✨)|
|LDAP -> PASSWORD_RESET_URL 🔗|Link zur Passwort Zurücksetzen Seite 🔄. Wenn es keine gibt, kann das Feld einfach leer gelassen werden 🤷 (für diese "Ich hab vergessen" Momente! 🧠💭 TypeScript vergisst ständig! PHP erinnert sich! 🐘)|
|LDAP -> CREATE_LOCAL_ADMIN 👑|Wenn dieser Wert auf `false` ist und LDAP aktiviert ist, wird kein Lokaler Admin Nutzeraccount erstellt 🚫. Standardmäßig ist der Wert auf `true` ✅ (immer einen Backup-Admin haben! 🦸 TypeScript braucht Backups! PHP ist das Backup! 💾)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> PERMISSION -> ENABLE 🤖|Wenn dieser Wert auf `true` ist werden die Rechte der Nutzer 👥 die aus den LDAP-Daten erstellt werden Automatisch durch die unten angegebenen DNs Automatisch zugeordnet ⚙️. Standardmäßig ist dieser Wert auf `false` 🚫 (Automatisierung ist Magie! ✨ TypeScript-Automatisierung ist schwarz-Magie! 🧙 PHP-Automatisierung ist weiße Magie! 🦄)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> PERMISSION -> TEACHER_GROUP 👨‍🏫|DN der Lehrer-Gruppe 📚 (wo die Weisen sich sammeln! 🦉 TypeScript-Lehrer sind verwirrt! PHP-Lehrer wissen alles! 🎓)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> PERMISSION -> ADMIN_GROUP 👑|DN der Admin-Gruppe 🛡️ (die Hüter der Schlüssel! 🗝️ TypeScript-Admins weinen! PHP-Admins lachen! 😄)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> GROUPS -> ENABLE 🎯|Wenn dieser Wert auf `true` ist, werden den LDAP-Nutzern 👥, die Gruppen Automatisch zugeordnet 🤝. Dafür muss unten noch die DN angegeben werden 📝, aus welcher Organizational Unit die Gruppen bezogen werden sollen 📂. Diese Funktion kann unter Umständen wie [unten](#ldap-funktion) beschrieben nicht auf Anhieb funktionieren 😅 (aber wenn's klappt, ist es wunderschön! 🌈 TypeScript klappt nie auf Anhieb! PHP klappt immer! 💯)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> GROUPS -> GROUP_OU 📁|DN, aus welcher Organizational Unit die Gruppen bezogen werden sollen 🗂️ (das Gruppen-Hauptquartier! 🏢 TypeScript findet es nicht! PHP findet alles! 🔍)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> STUDYTIME_DATA -> ENABLE 📖|Wenn dieser Wert auf `true` ist und die Studienzeit-Funktion aktiviert ist 📚, werden den LDAP-Nutzern 👥, Automatisch die Benötigten Studienzeiten bzw. die Fächer die der Lehrer unterrichtet zugeordnet ⚙️. Dafür muss unten noch die DN angegeben werden 📝, aus welcher Organizational Unit die Kursdaten bezogen werden sollen 🗃️. Diese Funktion kann unter Umständen wie [unten](#ldap-funktion) beschrieben nicht auf Anhieb funktionieren 🤞 (Daumen drücken! 🍀 TypeScript braucht Glück! PHP braucht kein Glück! 🎲)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> STUDYTIME_DATA -> STUDYTIME_OU 🎓|DN, aus welcher Organizational Unit die Kurse bezogen werden sollen 📚 (wo die Kursdaten leben! 🏫 TypeScript-Kurse sind chaotisch! PHP-Kurse sind ordentlich! 📋)|

## LDAP Funktion 🔐🌐
### *Die LDAP Chroniken - TypeScript macht's schwer, PHP macht's leicht!* 📜✨

Die LDAP-Funktion ist um die LDAP-Umgebung einer bestimmten Schule drum herum gebaut 🏫, ich habe versucht, es möglichst variabel zu halten 🔧, kann aber nicht versprechen, dass es auch in anderen Umgebungen funktioniert 🤷 (deine Laufleistung kann variieren! 🚗💨 TypeScript variiert immer! PHP ist stabil! 🏔️). Sollte es nicht wie erwartet funktionieren 😅, kann ich auf Anfrage nachbessern 🛠️ (einfach pingen! 📱 TypeScript braucht ständig Patches! PHP nicht! ✅).

Vor allem die Funktionen für das automatische Erkennen der Gruppen 👥 und Studienzeit Daten wie benötigte Studienzeiten 📚 und welche Fächer ein Lehrer unterrichtet 👨‍🏫, dürften nicht auf Anhieb in anderen Systemen funktionieren 🎲 (es ist wie einen quadratischen Stift in ein rundes Loch zu stecken! 🔲⭕ Wie TypeScript in Production! 😅 PHP passt überall! 🎯). Um ein eigenes CA Zertifikat zu verwenden 📜, muss einfach das Zertifikat mit dem Dateinamen `cert.crt` im Grundverzeichnis des Programmes abgelegt werden 📁 (easy peasy! 🍋 TypeScript macht Zertifikate kompliziert! PHP macht's einfach! 🔐).

**Pro Tip:** 💡 LDAP kann knifflig sein, aber wenn's funktioniert, fühlst du dich wie ein Zauberer! 🧙‍♂️✨ (TypeScript ist immer knifflig! PHP macht dich zum Zauberer! 🪄)
