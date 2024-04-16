#!/bin/sh

npx prisma migrate deploy
npx prisma prisma db seed
npm run start