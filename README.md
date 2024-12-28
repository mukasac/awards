This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm install
npm run dev

npm install prisma --save-dev
npm install @prisma/client 



```
ensure to add this to the .env file

DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

then 
```bash
npx prisma migrate dev --name init

npx prisma generate

```
for the first time only or when you delete the database:

```bash
npm run seed
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
