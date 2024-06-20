#!/bin/sh

npx prisma db push
npx prisma migrate deploy
npm run start