#!/bin/sh

npx prisma migrate deploy
npx prisma db seed
npx next start
