<<<<<<< HEAD
# freelancer
This is fiverr like clone website where you can book service
=======
# Freelance Marketplace (React + Firebase)

Role-based freelance marketplace with strict Buyer/Seller separation.

## Tech Stack
- React.js
- Firebase Authentication
- Firestore Database
- Firebase Storage
- React Router
- Material UI

## Roles
- `buyer`
- `seller`

User profile document schema in `users/{uid}`:
- `name`
- `email`
- `role` (`buyer` | `seller`)
- `profileImage`
- `description`
- `createdAt`

## Route Structure
### Public
- `/` (homepage)
- `/login`
- `/signup`
- `/gigs`
- `/gig/:id`

### Buyer-only
- `/buyer-dashboard`
- `/my-orders`
- `/reviews`
- `/order` (place order flow)

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
- role-aware profile docs

### `gigs`
- `sellerId`, `title`, `description`, `price`, `deliveryTime`, `category`, `rating`, `createdAt`, `imageUrls`

### `orders`
- `gigId`, `buyerId`, `sellerId`, `price`, `total`, `status`, `createdAt`
- statuses: `pending`, `in-progress`, `delivered`, `completed`, `cancelled`

### `reviews`
- `gigId`, `buyerId`, `rating`, `comment`, `sellerId`, `createdAt`

## Features by Role
### Buyer
- Browse gigs
- Place orders
- Track own orders
- Leave reviews on completed orders

### Seller
- Create gig (seller-only, includes image upload to Firebase Storage)
- View only own gigs (`where("sellerId", "==", currentUser.uid)`)
- Manage own orders
- View earnings analytics summary

## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Start app:
```bash
npm start
```
3. Build production:
```bash
npm run build
```

## Firebase Security
- Firestore rules: `firestore.rules`
- Storage rules: `storage.rules`

## Deployment
### Netlify
- Config: `netlify.toml`
- Build command: `npm run build`
- Publish dir: `build`

### Vercel
- Config: `vercel.json`
- SPA rewrite to `index.html` included

## Folder Structure (Key)
- `src/components/` reusable UI + route guards
- `src/context/` auth context
- `src/pages/` role-specific pages
- `src/services/` Firestore/Storage logic (`gigService`, `orderService`, `reviewService`)
- `firestore.rules`, `storage.rules` Firebase security

## Dummy Data
If Firestore has no gigs yet, marketplace automatically falls back to the local dataset in `src/data/gigsData.js`.
>>>>>>> d2cf519 (Update project files)
