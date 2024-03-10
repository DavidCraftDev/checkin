CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" VARCHAR(24) NOT NULL,
    "displayname" VARCHAR(50) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "permission" INT CHECK (permission >= 0 AND permission <= 2) DEFAULT 0,
    "group" VARCHAR(24)
);

CREATE TABLE "Events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "user" UUID NOT NULL,
    "cw" INT CHECK (cw >= 12024 AND cw <= 532024) NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Attendance" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userID" UUID NOT NULL,
    "eventID" UUID NOT NULL,
    "cw" INT CHECK (cw >= 12024 AND cw <= 532024) NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW()
);

INSERT INTO "User" (username, displayname, password, permission, "group")
VALUES ('user.name', 'Display Name', 'Test', 2, 'Class');
