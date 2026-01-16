# CheckIN 🎉✅
## *The Ultimate Check-In System* 🚀📋
### (Now with 100% more emojis! 🎊)


| :exclamation: 🎭 PLOT TWIST! 🎬 Das Checkin wird in der Zukunft komplett neugeschrieben, mit SolidJS für das Frontend 💅 und Hono als Backend 🚄! Dieses Funktion wird nur noch am leben erhalten bis die neue Version fertig ist ⏳. Die alte Codebasis ist sehr chaotisch und schwer wartbar 🌪️ (aber hey, wer ist das nicht? 😅). |
|----------------------------------------------|

Ein System, um die Anwesenheit von Schülerinnen und Schülern 👨‍🎓👩‍🎓 in Studienzeiten zu überprüfen 📊.
Die Studienzeit ist ein Konzept über dass selbstständigen Lernen 📚 in der Oberstufe 🎓.

**Fun Fact:** 💡 Dieses System hilft dabei sicherzustellen, dass Schüler tatsächlich da sind! 🕵️ Keine unsichtbaren Freunde erlaubt! 👻❌

## Installation 🛠️💻
### *Let's get this party started!* 🎉

### Über Docker Compose: 🐳🎪
#### *Because who doesn't love containers?* 📦✨

```yaml
services:
  web: # 🌐 The star of the show! ⭐
    container_name: checkin # 📛 Name tag, please!
    image: ghcr.io/davidcraftdev/checkin:main # 🖼️ Fresh from the registry!
    restart: always # 🔄 Like a boomerang, it always comes back! 🪃
    depends_on:
      - db # 🤝 Can't function without its database buddy!
    environment:
      - TZ=Europe/Berlin # ⏰ Berlin time, baby! 🇩🇪
      # Enable MAINTENANCE Mode (true/false). When enabled, only a MAINTENANCE page will be shown, the login is disabled. 🚧
      - MAINTENANCE:false # ✅ No maintenance here, we're OPEN! 🎊
      # Replace the following environment variables with your own values, you need to set the same values in the db service 🔐
      - POSTGRES_URL=postgres://postgres:postgres@db:5432/postgres # 🗄️ The secret tunnel to the database! 🚇
      # Set own default admin credentials 👑
      - DEFAULT_LOGIN_USERNAME=OwnUsername # 👤 Change me or regret it! 😱
      - DEFAULT_LOGIN_PASSWORD=OwnPassword # 🔑 Seriously, change this ASAP! 🚨
    ports:
      - "3030:3000" # 🚪 Knock knock! Who's there? Port 3030! 🎯
    volumes:
      - "/home/checkin/data:/app/data" # 💾 Where the magic data lives! ✨

  db: # 🗄️ The brain of the operation! 🧠
    container_name: checkin-db # 📛 Database name tag!
    image: postgres:16-alpine # 🏔️ PostgreSQL on Alpine - lightweight champion! 🏆
    restart: always # 🔄 Never give up, never surrender! 💪
    environment:
      - TZ=Europe/Berlin # ⏰ Same timezone as the web service! 🕐
      # Please replace the following environment variables with your own values, you need to set the same values in the checkin service 🔒
      - POSTGRES_USER=postgres # 👤 The database overlord! 👑
      - POSTGRES_PASSWORD=postgres # 🔐 CHANGE THIS or hackers will thank you! 🏴‍☠️
      - POSTGRES_DB=postgres # 🗃️ Database name extraordinaire!
    volumes:
      - checkin_pgdata:/var/lib/postgresql/data # 💿 Persistent storage for the win! 🎉

volumes:
  checkin_pgdata: # 📚 The library of data! 📖
    name: checkin_pgdata # 📛 Named and ready to rumble! 🥊
```

### Standalone 🦸‍♂️💪
#### *For the brave souls who go it alone!* 🏃‍♂️💨

Das CheckIN-System benötigt, wenn es eigenständig betrieben wird, eine externe PostgreSQL-Datenbank 🗄️ (your data needs a home! 🏠), den Connection String dafür muss im Prisma Ordner 📁 in der schema.prisma Datei in Zeile acht statt dem `env("POSTGRES_URL")` angeben werden oder alternativ in einer .env Datei hinterlegt werden 🔐. Die sonstigen Einstellungen werden in der config.json gesetzt 📝, die genauen Einstellungswerte werden in der Tabelle hier drunter genauer erläutert 📊 (it's like a treasure map! 🗺️). Zum Starten und Updaten muss zunächst die aktuelle Version des CheckIN von diesem GitHub Repository 🐙 von der Branch main geklont werden 📥. Darauf folgend müssen zunächst mit `npm i` 📦 die Dependencies installiert werden (coffee break time! ☕), dies sollte auch nach jedem Update geschehen 🔄. Anschließend kann das System jederzeit mit `npm run start` 🚀 gestartet werden (3, 2, 1... liftoff! 🛸). Das Webinterface ist darauf folgend unter localhost:3000 aufrufbar 🌐 (knock knock on port 3000! 🚪). 

|Attribute 🏷️|Beschreibung 📖|
|---------|------------|
|MAINTENANCE 🚧|Wenn dieser Wert auf `true` ist, ist der Wartungsmodus aktiviert 🛠️, beim Aufrufen egal welcher Seite des CheckIN Systems wird eine Wartungsseite angezeigt 🚫, ein Login ist nicht möglich 🔒. Der Wert ist standardmäßig auf `false` ✅ (because who wants maintenance mode on by default? 😅).|
|AUTH_SECRET 🔐|Der Wert womit die Nutzerdaten die im Cookie 🍪 beim Nutzer gespeichert werden, verschlüsselt werden 🔒. **Unbedingt einen eigenen Geheimen Wert setzen! 🚨** (No really, like RIGHT NOW! ⚡ Your security depends on it! 🛡️)|
|DEFAULT_LOGIN -> Username 👤|Der Nutzername des Adminnutzers 👑 der Standardmäßig erstellt wird, wenn kein Nutzer mit Admin Rechten existiert. Dieser Wert sollte nicht der Standard Wert sein! 🙅 (Seriously, "admin" is SO 1999! 📟)|
|DEFAULT_LOGIN -> Password 🔑|Passwort des Standard Adminnutzers 🔐. Dieser Wert sollte nicht der Standard Wert sein! 😱 (Please don't use "password123" 🤦 - your future self will thank you! 🙏)|
|LDAP -> Enabled 🔌|**Dieser Wert darf nur vor dem ersten Nutzen des Systems verändert werden! ⚠️** Wenn dieser Wert auf `true` ist wird LDAP 🌐 statt dem eigenen Auth System verwendet 🔐. Der Wert ist standardmäßig auf `false` ✅. Kann unter umständen nicht Problemlos laufen 😬, mehr dazu [hier](#ldap-funktion) (it's an adventure! 🎢).|
|LDAP -> URI 🌐|Die URI des LDAP-Servers 🖥️, beginnend mit `ldap://` oder `ldaps://` 🔒 (the 's' stands for "super secure"! 🦸)|
|LDAP -> LDAP_TLS_REJECT_UNAUTHORIZED 🛡️|Wenn ein eigenes CA-Zertifikat 📜 verwendet wird und nicht wie im Absatz [unten](#ldap-funktion) beschrieben ein eigenes hinterlegt wird, sollte dieser Wert auf `true` gesetzt werden ✅. Standardmäßig ist er auf `false` 🚫 (TLS certificates - because we trust, but verify! 🕵️)|
|LDAP -> BIND_CREDENTIALS -> DN 🎫|DN des Nutzers mit Leserechten 👁️ im LDAP 📖 (the key to the kingdom! 🔑)|
|LDAP -> BIND_CREDENTIALS -> Password 🔐|Passwort des Nutzers mit Leserechten im LDAP 🔒 (shhh, it's a secret! 🤫)|
|LDAP -> SEARCH_BASE 🔍|LDAP Search Base 🏠 (where the search party starts! 🎉)|
|LDAP -> USER_SEARCH_FILTER 🔎|LDAP Filter 🕵️, womit Nutzerdaten abgefragt 📊, und überprüft wird ob der Nutzer Zugriff auf das System hat ✅. Mehr zu Filtern [hier](https://ldap.com/ldap-filters/) 📚 (filter like a coffee maker! ☕)|
|LDAP -> PASSWORD_RESET_URL 🔗|Link zur Passwort Zurücksetzen Seite 🔄. Wenn es keine gibt, kann das Feld einfach leer gelassen werden 🤷 (for those "I forgot" moments! 🧠💭)|
|LDAP -> CREATE_LOCAL_ADMIN 👑|Wenn dieser Wert auf `false` ist und LDAP aktiviert ist, wird kein Lokaler Admin Nutzeraccount erstellt 🚫. Standardmäßig ist der Wert auf `true` ✅ (always have a backup admin! 🦸)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> PERMISSION -> ENABLE 🤖|Wenn dieser Wert auf `true` ist werden die Rechte der Nutzer 👥 die aus den LDAP-Daten erstellt werden Automatisch durch die unten angegebenen DNs Automatisch zugeordnet ⚙️. Standardmäßig ist dieser Wert auf `false` 🚫 (automation is magic! ✨)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> PERMISSION -> TEACHER_GROUP 👨‍🏫|DN der Lehrer-Gruppe 📚 (where the wise ones gather! 🦉)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> PERMISSION -> ADMIN_GROUP 👑|DN der Admin-Gruppe 🛡️ (the keepers of the keys! 🗝️)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> GROUPS -> ENABLE 🎯|Wenn dieser Wert auf `true` ist, werden den LDAP-Nutzern 👥, die Gruppen Automatisch zugeordnet 🤝. Dafür muss unten noch die DN angegeben werden 📝, aus welcher Organizational Unit die Gruppen bezogen werden sollen 📂. Diese Funktion kann unter Umständen wie [unten](#ldap-funktion) beschrieben nicht auf Anhieb funktionieren 😅 (but when it works, it's beautiful! 🌈)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> GROUPS -> GROUP_OU 📁|DN, aus welcher Organizational Unit die Gruppen bezogen werden sollen 🗂️ (the group headquarters! 🏢)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> STUDYTIME_DATA -> ENABLE 📖|Wenn dieser Wert auf `true` ist und die Studienzeit-Funktion aktiviert ist 📚, werden den LDAP-Nutzern 👥, Automatisch die Benötigten Studienzeiten bzw. die Fächer die der Lehrer unterrichtet zugeordnet ⚙️. Dafür muss unten noch die DN angegeben werden 📝, aus welcher Organizational Unit die Kursdaten bezogen werden sollen 🗃️. Diese Funktion kann unter Umständen wie [unten](#ldap-funktion) beschrieben nicht auf Anhieb funktionieren 🤞 (fingers crossed! 🍀)|
|LDAP -> AUTOMATIC_DATA_DETECTION -> STUDYTIME_DATA -> STUDYTIME_OU 🎓|DN, aus welcher Organizational Unit die Kurse bezogen werden sollen 📚 (where the course data lives! 🏫)|

## LDAP Funktion 🔐🌐
### *The LDAP Chronicles* 📜✨

Die LDAP-Funktion ist um die LDAP-Umgebung einer bestimmten Schule drum herum gebaut 🏫, ich habe versucht, es möglichst variabel zu halten 🔧, kann aber nicht versprechen, dass es auch in anderen Umgebungen funktioniert 🤷 (your mileage may vary! 🚗💨). Sollte es nicht wie erwartet funktionieren 😅, kann ich auf Anfrage nachbessern 🛠️ (just ping me! 📱).

Vor allem die Funktionen für das automatische Erkennen der Gruppen 👥 und Studienzeit Daten wie benötigte Studienzeiten 📚 und welche Fächer ein Lehrer unterrichtet 👨‍🏫, dürften nicht auf Anhieb in anderen Systemen funktionieren 🎲 (it's like trying to fit a square peg in a round hole! 🔲⭕). Um ein eigenes CA Zertifikat zu verwenden 📜, muss einfach das Zertifikat mit dem Dateinamen `cert.crt` im Grundverzeichnis des Programmes abgelegt werden 📁 (easy peasy! 🍋).

**Pro Tip:** 💡 LDAP can be tricky, but once it works, you'll feel like a wizard! 🧙‍♂️✨
