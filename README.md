# Dhaka Engineering Service

Your Trusted Engineering & Home Service Partner.

A full-stack booking platform for home and commercial engineering services in Dhaka — AC, electrical, lift, appliances, motor, and commercial work. Customers can browse services, book jobs, and track status. Admins manage bookings, content, technicians, and media from a dedicated panel.

## Features

- Public service catalog with category details and image galleries
- Booking flow with preferred date/time and problem description
- Booking tracking and customer reviews
- Admin panel for bookings, technicians, services, banners, offers, reviews, and settings
- Image uploads to Cloudinary (services, banners, offers)
- Persistent data on MongoDB Atlas

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Express, Mongoose, Zod |
| Database | MongoDB Atlas |
| Media | Cloudinary |
| Auth | JWT (admin), bcrypt password hashing |

## Project Structure

```text
├── src/                 # React client (public site + admin UI)
├── server/src/          # Express API, models, routes, seed
├── public/              # Static assets and SEO files
├── .env.example         # Environment variable template
└── package.json
```

## Prerequisites

- Node.js 20+ and npm
- MongoDB Atlas cluster with your current IP allowlisted
- Cloudinary account (cloud name, API key, API secret)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/amirxfoysal/dhaka-engineering-service.git
cd dhaka-engineering-service
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string (include DB name) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `JWT_SECRET` | Long random string for admin JWT signing |
| `ADMIN_USERNAME` | Seed admin username (default: `admin`) |
| `ADMIN_PASSWORD` | Seed admin password (default: `Admin@123`) |
| `PORT` | API port (default: `5000`) |
| `CLIENT_ORIGIN` | Frontend origin for CORS (default: `http://localhost:5173`) |

Never commit `.env`. Only `.env.example` belongs in the repository.

### 3. Seed the database

```bash
npm run seed
```

This upserts default settings, service categories, banners, offers, reviews, technicians, and a bootstrap admin user. Demo bookings are inserted only when the bookings collection is empty.

### 4. Run locally

```bash
npm run dev
```

This starts:

- API on [http://localhost:5000](http://localhost:5000)
- Vite client on [http://localhost:5173](http://localhost:5173) (or the next free port)

Vite proxies `/api` requests to the Express server.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run API and client together |
| `npm run dev:server` | API only (watch mode) |
| `npm run dev:client` | Vite client only |
| `npm run seed` | Seed MongoDB with defaults |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

## Admin Access

- URL: `/admin/login`
- Default credentials (from seed / `.env`): `admin` / `Admin@123`

Change the admin password after first login in **Admin → Settings**.

## API Overview

Public endpoints include health, settings, categories, banners, offers, reviews, and booking create/read.

Admin endpoints (Bearer JWT) cover credentials, CRUD for content and technicians, booking updates, notifications, settings, and image uploads to Cloudinary.

## Deployment (Vercel)

Production URL: [https://dhaka-engineering-service.vercel.app](https://dhaka-engineering-service.vercel.app)

Custom domain: `dhakaengineering.com` (Hostinger)

### Hostinger DNS (required)

In Hostinger → Domains → `dhakaengineering.com` → DNS / DNS Zone, set:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `216.198.79.1` |
| A | `@` | `64.29.17.1` |
| CNAME | `www` | `cname.vercel-dns.com` |

Remove any conflicting Hostinger parking A/CNAME records first. DNS can take a few minutes to a few hours.

Alternative: change nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com` so Vercel manages DNS.

### MongoDB Atlas for Vercel

Allow Network Access from anywhere (`0.0.0.0/0`) so Vercel serverless functions can connect.

### Redeploy

```bash
vercel --prod
```

## Security Notes

- Keep secrets in `.env` only
- Allowlist your IP (or `0.0.0.0/0` for open access) in MongoDB Atlas Network Access
- Rotate database and Cloudinary credentials if they were ever shared outside a secure channel

## License

Private project. All rights reserved.
