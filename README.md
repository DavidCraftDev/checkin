# CheckIN

Ein System, um die Anwesenheit von Schülerinnen und Schülern zu überprüfen.
Zudem ist es möglich, erfüllte Studienzeiten von Schülerinnen und Schüler zu überprüfen. 
Die Studienzeit ist ein Konzept über dass selbstständigen Lernen in der Oberstufe.

## Installation

### Über Docker Compose:

```yaml
services:
  web:
    container_name: checkin
    image: ghcr.io/davidcraftdev/checkin:stable
    restart: always
    depends_on:
      - db
    environment:
      - TZ=Europe/Berlin
      # Enable Maintance Mode (true/false). When enabled, only a maintance page will be shown, the login is disabled.
      - MAINTANCE:false
      # Replace the following environment variables with your own values, you need to set the same values in the db service
      - POSTGRES_URL=postgres://postgres:postgres@db:5432/postgres
      # Replace the following environment variables with your own random secret
      - AUTH_SECRET=YOUR_SECRET
      # Set own default admin credentials
      - DEFAULT_LOGIN_USERNAME=OwnUsername
      - DEFAULT_LOGIN_PASSWORD=OwnPassword
      # Enable the study time feature (true/false). Once enabled, the feature should not be disabled.
      - STUDYTIME=false
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

Das CheckIN-System benötigt, wenn es eigenständig betrieben wird, eine externe PostgreSQL-Datenbank, den Connection String dafür muss im Prisma Ordner in der schema.prisma Datei in Zeile acht statt dem `env("POSTGRES_URL")` angeben werden oder alternativ in einer .env Datei hinterlegt werden. Die sonstigen Einstellungen werden in der config.json gesetzt, die genauen Einstellungswerte werden in der Tabelle hier drunter genauer erläutert. Zum Starten und Updaten muss zunächst die aktuelle Version des CheckIN von diesem GitHub Repository von der Branch stable geklont werden. Darauf folgend müssen zunächst mit `npm i` die Dependencies installiert werden, dies sollte auch nach jedem Update geschehen. Anschließend kann das System jederzeit mit `npm run start` gestartet werden. Das Webinterface ist darauf folgend unter localhost:3000 aufrufbar. 

|Attribute|Beschreibung|
|---------|------------|
|MAINTANCE|Wenn dieser Wert auf true ist, ist der Wartungsmodus aktiviert, beim Aufrufen egal welcher Seite des CheckIN Systems wird eine Wartungsseite angezeigt, ein Login ist nicht möglich. Der Wert ist standardmäßig auf false.
|More Soon...|Moor Soon...|
|
|
|

## LDAP Funktion

Die LDAP-Funktion ist um die LDAP-Umgebung einer bestimmten Schule drum herum gebaut, ich habe versucht, es möglichst variable zu halten, kann aber nicht versprechen, das es auch in anderen Umgebungen zu funktioniert. Sollte es nicht wie erwartet funktionieren, kann ich auf Anfrage nachbessern.
Vor allem die Funktionen für das automatische Erkennen der Gruppen und Studienzeit Daten wie benötigte Studienzeiten und welche Fächer ein Lehrer unterrichtet, dürfte nicht auf Anhieb in anderen Systemen funktionieren. Um ein eigenes CA Zertifikat zu verwenden, muss einfach das Zertifikat mit dem Dateinamen `cert.crt` im Grundverzeichnis des Programmes abgelegt werden.