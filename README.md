# CheckIN

Ein System, um die Anwesenheit von Schülerinnen und Schülern in Studienzeiten zu überprüfen.
Die Studienzeit ist ein Konzept über dass selbstständigen Lernen in der Oberstufe.

## Installation

### Über Docker Compose:

```yaml
services:
  web:
    container_name: checkin
    image: ghcr.io/davidcraftdev/checkin:main
    restart: always
    depends_on:
      - db
    environment:
      - TZ=Europe/Berlin
      # Enable Maintance Mode (true/false). When enabled, only a maintance page will be shown, the login is disabled.
      - MAINTANCE:false
      # Replace the following environment variables with your own values, you need to set the same values in the db service
      - POSTGRES_URL=postgres://postgres:postgres@db:5432/postgres
      # Replace the following environment variables with your own random secret to encrypt the login JWT tokens
      - AUTH_SECRET=YOUR_SECRET
      # Set own default admin credentials
      - DEFAULT_LOGIN_USERNAME=OwnUsername
      - DEFAULT_LOGIN_PASSWORD=OwnPassword
      # The LDAP auth feature may not work with your envorinment. Please test it before using it in production, and when it not works, ask for help!
      # Use the LDAP auth feature instead of the own user management from the CheckIN (true/false). Please only enable before the first start of the CheckIN, and not disable it after the first start.
      - USE_LDAP=false
      # LDAP server URL starting with ldap:// or ldaps://
      - LDAP_URI=ldap://ldap.example.com
      # Reject unauthorized TLS certificates when connect to the LDAP server (true/false)
      - LDAP_TLS_REJECT_UNAUTHORIZED=true
      # LDAP bind DN credentials
      - LDAP_BIND_DN=cn=admin,dc=example,dc=com
      - LDAP_BIND_PASSWORD=example
      # LDAP search base
      - LDAP_SEARCH_BASE=dc=example,dc=com
      # LDAP user search filter
      - LDAP_USER_SEARCH_FILTER=(cn=*)
      # LDAP URL to the password reset page, leave empty to disable the password reset link on the login page
      - LDAP_PASSWORD_RESET_URL=https://example.com/password-reset
      # Create local admin user if LDAP auth is enabled (true/false) The user will be created with the default admin credentials, the username will start with "local/". This only run once, when you change the login data, please save it.
      - LDAP_CREATE_LOCAL_ADMIN=true
      # Automaticlly set user permission from ldap groups (true/false)
      - LDAP_AUTO_PERMISSION=false
      - LDAP_AUTO_PERMISSION_TEACHER_GROUP=CN=Teacher,OU=Maingroups,OU=Groups,OU=Example-School,DC=example,DC=de
      - LDAP_AUTO_PERMISSION_ADMIN_GROUP=CN=Teacher,OU=Maingroups,OU=Groups,OU=Example-School,DC=example,DC=de
      # Experimental feature: Automatically detect users group from LDAP groups (true/false), set the OU where the groups are stored
      - LDAP_AUTO_GROUPS=false
      - LDAP_AUTO_GROUPS_OU=OU=Classes,OU=Groups,OU=Example-School,DC=example,DC=de
      # Experimental feature: Automatically detect users needed studyTimes from LDAP groups (true/false), set the OU where the courses like english, german or math are stored
      - LDAP_AUTO_STUDYTIME_DATA=false
      - LDAP_AUTO_STUDYTIME_DATA_OU=OU=Courses,OU=Groups,OU=Example-School,DC=example,DC=de
    ports:
      - "3030:3000"
    # Uncomment the following lines to use a custom ca certificate, you need to replace the path with your own certificate path
    #volumes:
    #  - "/opt/checkin/cert.crt:/app/certificate.crt:ro"
  db:
    container_name: checkin-db
    image: postgres:16-alpine
    restart: always
    environment:
      - TZ=Europe/Berlin
      # Please replace the following environment variables with your own values, you need to set the same values in the checkin service
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=postgres
    volumes:
      - checkin_pgdata:/var/lib/postgresql/data

volumes:
  checkin_pgdata:
    name: checkin_pgdata
```

### Standalone

Das CheckIN-System benötigt, wenn es eigenständig betrieben wird, eine externe PostgreSQL-Datenbank, den Connection String dafür muss im Prisma Ordner in der schema.prisma Datei in Zeile acht statt dem `env("POSTGRES_URL")` angeben werden oder alternativ in einer .env Datei hinterlegt werden. Die sonstigen Einstellungen werden in der config.json gesetzt, die genauen Einstellungswerte werden in der Tabelle hier drunter genauer erläutert. Zum Starten und Updaten muss zunächst die aktuelle Version des CheckIN von diesem GitHub Repository von der Branch main geklont werden. Darauf folgend müssen zunächst mit `npm i` die Dependencies installiert werden, dies sollte auch nach jedem Update geschehen. Anschließend kann das System jederzeit mit `npm run start` gestartet werden. Das Webinterface ist darauf folgend unter localhost:3000 aufrufbar. 

|Attribute|Beschreibung|
|---------|------------|
|MAINTANCE|Wenn dieser Wert auf `true` ist, ist der Wartungsmodus aktiviert, beim Aufrufen egal welcher Seite des CheckIN Systems wird eine Wartungsseite angezeigt, ein Login ist nicht möglich. Der Wert ist standardmäßig auf `false`.|
|AUTH_SECRET|Der Wert womit die Nutzerdaten die im Cookie beim Nutzer gespeichert werden, verschlüsselt werden. **Unbedingt einen eigenen Geheimen Wert setzen!**|
|DEFAULT_LOGIN -> Username|Der Nutzername des Adminnutzers der Standardmäßig erstellt wird, wenn kein Nutzer mit Admin Rechten existiert. Dieser Wert sollte nicht der Standard Wert sein.|
|DEFAULT_LOGIN -> Password|Passwort des Standard Adminnutzers. Dieser Wert sollte nicht der Standard Wert sein.|
|LDAP -> Enabled|**Dieser Wert darf nur vor dem ersten Nutzen des Systems verändert werden!** Wenn dieser Wert auf `true` ist wird LDAP statt dem eigenen Auth System verwendet. Der Wer ist standardmäßig auf `false`. Kann unter umständen nicht Problemlos laufen, mehr dazu [hier](#ldap-funktion).|
|LDAP -> URI|Die URI des LDAP-Servers, beginend mit `ldap://` oder `ldaps://`.|
|LDAP -> LDAP_TLS_REJECT_UNAUTHORIZED|Wenn ein eigenes CA-Zertifikat verwendet wird und nicht wie im Absatz [unten](#ldap-funktion) beschrieben ein eigenes hinterlegt wird, sollte dieser Wert auf `true` gesetzt werden. Standardmäßig ist er auf `false`.|
|LDAP -> BIND_CREADENTIALS -> DN|DN des Nutzers mit Leserechten im LDAP|
|LDAP -> BIND_CREADENTIALS -> Password|Passwort des Nutzers mit Leserechten im LDAP|
|LDAP -> SEARCH_BASE|LDAP Search Base|
|LDAP -> USER_SEARCH_FILTER|LDAP Filter, womit Nutzerdaten abgefragt, und überprüft wird ob der Nutzer zugriff auf das System hat. Mehr zu Filtern [hier](https://ldap.com/ldap-filters/).|
|LDAP -> PASSWORD_RESET_URL|Link zur Passwort Zurücksetzen Seite. Wenn es keine gibt, kann das Feld einfach leer gelassen werden.|
|LDAP -> CREATE_LOCAL_ADMIN|Wenn dieser Wert auf `false` ist und LDAP aktiviert ist, wird kein Lokaler Admin Nutzeraccount erstellt. Standardmäßig ist der Wert auf `true`.|
|LDAP -> AUTOMATIC_DATA_DETECTION -> PERMISSION -> ENABLE|Wenn dieser Wert auf `true` ist werden die Rechte der Nutzer die aus den LDAP-Daten erstellt werden Automatisch durch die unten angegebenen DNs Automatisch zugeordnet. Standardmäßig ist dieser Wert auf `false`.|
|LDAP -> AUTOMATIC_DATA_DETECTION -> PERMISSION -> TEACHER_GROUP|DN der Lehrer-Gruppe.|
|LDAP -> AUTOMATIC_DATA_DETECTION -> PERMISSION -> ADMIN_GROUP|DN der Admin-Gruppe.|
|LDAP -> AUTOMATIC_DATA_DETECTION -> GROUPS -> ENABLE|Wenn dieser Wert auf `true` ist, werden den LDAP-Nutzern, die Gruppen Automatisch zugeordnet. Dafür muss unten noch die DN angegeben werden, aus welcher Organizational Unit die Gruppen bezogen werden sollen. Diese Funktion kann unter Umständen wie [unten](#ldap-funktion) beschrieben nicht auf anhieb funktionieren.|
|LDAP -> AUTOMATIC_DATA_DETECTION -> GROUPS -> GROUP_OU|DN, aus welcher Organizational Unit die Gruppen bezogen werden sollen.|
|LDAP -> AUTOMATIC_DATA_DETECTION -> STUDYTIME_DATA -> ENABLE|Wenn dieser Wert auf `true` ist und die Studienzeit-Funktion aktiviert ist, werden den LDAP-Nutzern, Automatisch die Benötigten Studienzeiten bzw. die Fächer die der Lehrer unterrichtet zugeordnet. Dafür muss unten noch die DN angegeben werden, aus welcher Organizational Unit die Kursdaten bezogen werden sollen. Diese Funktion kann unter Umständen wie [unten](#ldap-funktion) beschrieben nicht auf anhieb funktionieren.|
|LDAP -> AUTOMATIC_DATA_DETECTION -> STUDYTIME_DATA -> STUDYTIME_OU|DN, aus welcher Organizational Unit die Kurse bezogen werden sollen.|

## Studienzeit Funktion

Hier wird in Zukunft die Studienzeit-Funktion erklärt.

## LDAP Funktion

Die LDAP-Funktion ist um die LDAP-Umgebung einer bestimmten Schule drum herum gebaut, ich habe versucht, es möglichst variable zu halten, kann aber nicht versprechen, das es auch in anderen Umgebungen zu funktioniert. Sollte es nicht wie erwartet funktionieren, kann ich auf Anfrage nachbessern.
Vor allem die Funktionen für das automatische Erkennen der Gruppen und Studienzeit Daten wie benötigte Studienzeiten und welche Fächer ein Lehrer unterrichtet, dürfte nicht auf Anhieb in anderen Systemen funktionieren. Um ein eigenes CA Zertifikat zu verwenden, muss einfach das Zertifikat mit dem Dateinamen `cert.crt` im Grundverzeichnis des Programmes abgelegt werden.
