# Freelance Marketplace (React + Firebase)

A Fiverr-style freelance marketplace with strict Buyer/Seller role separation, Firebase-backed auth/data, and production deployment configs.

## Tech Stack
- React (CRA)
- Firebase Authentication
- Firestore
- Firebase Storage
- React Router
- Material UI

## Roles
- `buyer`
- `seller`

User profile document schema (`users/{uid}`):
- `name`
- `email`
- `role` (`buyer` | `seller`)
- `profileImage`
- `description`
- `createdAt`

## Route Structure

### Public
- `/`
- `/login`
- `/signup`
- `/gigs`
- `/gig/:id`

### Buyer-only
- `/buyer-dashboard`
- `/my-orders`
- `/reviews`
- `/order`

### Seller-only
- `/seller-dashboard`
- `/create-gig`
- `/my-gigs`
- `/manage-orders`
- `/earnings`

### Shared authenticated
- `/messages`
- `/chat/:orderId`
- `/profile`

## Access Control Rules
- Buyers cannot access seller pages.
- Sellers cannot access buyer pages.
- Unauthorized buyer access to seller routes redirects to `/`.
- Unauthorized seller access to buyer routes redirects to `/seller-dashboard`.

## Collections

### `users`
Role-aware profile docs.

### `gigs`
`sellerId`, `title`, `description`, `price`, `deliveryTime`, `category`, `rating`, `createdAt`, `imageUrls`

### `orders`
`gigId`, `buyerId`, `sellerId`, `price`, `total`, `status`, `createdAt`

Statuses:
- `pending`
- `in-progress`
- `delivered`
- `completed`
- `cancelled`

### `reviews`
`gigId`, `buyerId`, `rating`, `comment`, `sellerId`, `createdAt`

## Features by Role

### Buyer
- Browse gigs
- Place orders
- Track own orders
- Leave reviews on completed orders

### Seller
- Create gig (seller-only; includes image upload to Firebase Storage)
- View only own gigs (`where("sellerId", "==", currentUser.uid)`)
- Manage own orders
- View earnings summary

## Local Setup
1. Install dependencies:
	```bash
	npm install
	```
2. Start development server:
	```bash
	npm start
	```
3. Build production bundle:
	```bash
	npm run build
	```
4. Run lint checks:
	```bash
	npm run lint
	```

## Environment Setup
Create `.env` from `.env.example` and fill Firebase values.

## Firebase Security
- Firestore rules: `firestore.rules`
- Storage rules: `storage.rules`

## Deployment

### Netlify
- Config: `netlify.toml`
- Build command: `npm run build`
- Publish directory: `build`

### Vercel
- Config: `vercel.json`
- SPA rewrite to `index.html` included

## CI
GitHub Actions workflow (`.github/workflows/ci.yml`) runs install and build on pushes/PRs to `main`.

## Project Structure (Key)
- `src/components/`: reusable UI + route guards
- `src/context/`: auth context
- `src/pages/`: role-specific and shared pages
- `src/services/`: Firestore/Storage logic
- `src/utils/`: shared helpers (including currency formatting)

## Dummy Data Fallback
If Firestore has no gigs, marketplace pages can fall back to local data from `src/data/gigsData.js`.
