# Bancom

**An electronics storefront with customer checkout and practical store administration.**

Bancom is a full-stack ecommerce portfolio project built with Node.js, Express, EJS, and MongoDB. Customers can discover products, manage a shopping bag, complete a simulated payment, and review their purchases. Administrators manage the catalogue, inspect customer orders, explore sales reports, and customise the storefront.

Payments are simulated: no money is collected and no real card or bank details are required. Catalogue prices, checkout totals, and stored orders use Malaysian ringgit (MYR).

## Features

### Shopping experience

- **Product discovery:** search by product name or brand, filter by category or collection tag, sort by price/name/newest, and browse paginated results.
- **Product details:** image galleries with selectable thumbnails, descriptions, specifications, and clearly labelled fictional demo products.
- **Shopping bag:** add and remove products, update quantities, and keep bag contents with the signed-in account.
- **Two checkout paths:** purchase the shopping bag or use a separate quick checkout for one product without changing the bag.
- **Simulated payments:** choose a test card, bank, or wallet method and simulate approval or decline. Declines create no order and preserve the items for retry.
- **Customer accounts:** registration, sign-in, sign-out, a profile photo, contact details, and a delivery address. A complete profile is required before checkout.
- **Order history:** view personal orders and an ownership-checked confirmation page with the product, price, payment, and delivery details captured for that order.
- **Display currencies:** approximate conversions to SGD, USD, EUR, GBP, and JPY using server-fetched reference rates. Checkout records remain in MYR.

### Store administration

- **Catalogue management:** create, edit, and delete products; organise products using categories and collection tags.
- **Image management:** retain 1–6 product images, upload JPG/PNG files up to 2 MB each, remove or restore selections, choose the cover image, and preview the gallery before saving.
- **Customer orders:** inspect orders across all customers in a paginated administration view.
- **Sales reporting:** order value, order count, units sold, average order value, unique customers, product revenue, best sellers, and category performance. Chart.js provides trend, bar, and doughnut charts alongside readable tables.
- **Reporting filters:** last 7, 30, or 90 days, all time, or an inclusive custom date range. Dates use UTC+8, labelled Singapore time in the interface. Successful simulated payments and legacy orders are separate datasets.
- **Homepage editor:** configure hero text, colours, local call-to-action links, featured collections, slide images, autoplay, and rotation timing. Use automatic collections or up to 12 manually selected slides.
- **Site appearance:** preview and save Forest, Ocean, Terracotta, Plum, or Slate. The saved theme applies to all visitors; applying its colours to the homepage hero is optional.

## Technology

| Area              | Implementation                                     |
| ----------------- | -------------------------------------------------- |
| Application       | Node.js 24.x, Express, CommonJS                    |
| Views             | Server-rendered EJS templates                      |
| Browser interface | CSS and vanilla JavaScript enhancements            |
| Database          | MongoDB with Mongoose models                       |
| Authentication    | bcrypt password hashes and MongoDB-backed sessions |
| Forms and uploads | CSRF middleware, server-side validation, Multer    |
| Reporting         | Chart.js, served locally                           |
| Local database    | MongoDB 7 through Docker Compose                   |

The Express application serves both the pages and static assets. There is no separate frontend development server or asset build step.

## Run locally

### Requirements

- Node.js **24.x**, matching `.nvmrc` and `package.json`.
- npm and Git. One legacy dependency is installed directly from GitHub.
- Docker Desktop running Linux containers, or another reachable MongoDB instance.

### Start the application

From the repository root:

```sh
npm ci
cp .env.example .env
```

In PowerShell, `Copy-Item .env.example .env` is an alternative to `cp`. Set a stable, random `SESSION_SECRET` in `.env`, then start the local database and add the optional catalogue:

```sh
docker compose up -d
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `npm run dev` restarts the application when server files change; `npm start` runs it without watch mode.

The default local database starts empty. The seed script adds **24 fictional electronics products** across six categories, with original SVG illustrations and illustrative specifications/prices. Stable product IDs and insert-only updates prevent duplicates and preserve existing products and administrator edits. It does not create accounts or orders, and it does not copy cloud data.

If you already have MongoDB, set `MONGODB_URI` and skip the Docker command. The seed script writes to that configured database.

### Configuration

The npm scripts load `.env` through Node's `--env-file-if-exists` option.

| Variable         | Default                                  | Purpose                                                                                                    |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`    | `mongodb://127.0.0.1:27017/bancom`       | Database connection used by the app, session store, and seed script.                                       |
| `PORT`           | `3000`                                   | Application HTTP port.                                                                                     |
| `SESSION_SECRET` | Generated for each process when omitted  | Signs session cookies. Set a stable random value so restarts do not invalidate existing cookies.           |
| `NODE_ENV`       | Express development behaviour when unset | Set to `production` for production error rendering; this alone does not configure a production deployment. |

Generate a session secret locally with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep `.env` out of version control. No payment-provider credentials are needed for the simulated checkout.

### Create customer and administrator accounts

1. Register at `/signup`, then sign in at `/login`.
2. Complete the profile page with the required contact and delivery details.
3. To access store management, promote your own local account in MongoDB. There is currently no administrator provisioning screen or seeded administrator account.

For the default Docker database, open MongoDB's shell:

```sh
docker compose exec mongo mongosh bancom
```

Run the following in **mongosh**, replacing the email with the account you registered:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } });
```

Confirm that `matchedCount` is `1`, exit mongosh, and sign out/in again. Store-management links appear in the account menu. If using a different MongoDB connection or database name, apply the update there instead.

### Stop and restart

- Stop the application with **Ctrl+C**.
- Stop MongoDB with `docker compose stop` and restart it with `docker compose up -d`.
- MongoDB data persists in the Compose volume declared as `bancom_mongo`; Docker may prefix its name with the Compose project name.
- `docker compose down` removes the containers while retaining the named volume. Adding `--volumes` deletes that local database, including accounts, products, orders, and sessions.

## Try the complete workflow

1. Seed the catalogue, register a customer, and complete their profile.
2. Search, filter, and sort the catalogue; open a product and inspect its gallery.
3. Add products to the bag and change a quantity.
4. Simulate a declined payment. Confirm that no order was created and the bag remains available.
5. Retry with an approved simulated payment and open the order confirmation and personal order history.
6. Try quick checkout from a product and confirm that the existing bag is unaffected.
7. Sign in as an administrator and review `/admin/orders` and `/admin/reports`. A fresh database needs successful simulated checkouts before the default report contains data.
8. Edit a product, preview its images, configure the homepage hero, and save a different site theme.

The repository currently provides no automated test or lint script. This walkthrough is a manual smoke-check guide, not a claim of automated test coverage.

## Main routes

| Route                                          | Access                                    | Purpose                                                 |
| ---------------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| `/`                                            | Public                                    | Storefront, catalogue search, filters, and pagination.  |
| `/pDetail?pid=<product-id>`                    | Public                                    | Product details and image gallery.                      |
| `/signup`, `/login`                            | Public                                    | Account registration and sign-in.                       |
| `/profile`                                     | Signed-in account                         | Profile, contact details, delivery address, and avatar. |
| `/cart`                                        | Signed-in account                         | Shopping bag and bag checkout.                          |
| `/checkout`                                    | Signed-in account with a complete profile | Review a quick checkout started from a product.         |
| `/order`, `/order/:id`                         | Signed-in order owner                     | Personal purchase history and order confirmation.       |
| `/addProduct`, `/editProduct?pid=<product-id>` | Admin                                     | Catalogue editing.                                      |
| `/admin/orders`                                | Admin                                     | Orders across all customers.                            |
| `/admin/reports`                               | Admin                                     | Filtered sales reports and charts.                      |
| `/admin/homepage`                              | Admin                                     | Homepage content and hero carousel settings.            |
| `/admin/appearance`                            | Admin                                     | Store-wide theme settings.                              |
| `/api/exchange-rates`                          | Public                                    | Reference currency quotes used for display conversions. |

## Architecture and decisions

```text
Browser
  ├─ EJS pages, CSS, and browser JavaScript
  └─ Form submissions / selected JSON requests
                  │
             Express routes
                  │
      Authentication, CSRF, validation, uploads
                  │
          Controllers and services
                  │
          Mongoose → MongoDB
```

- **Server-owned prices:** checkout reloads products and calculates totals on the server, using integer-cent arithmetic for calculations. The current demo adds fixed RM 6 shipping and RM 5 tax; these are illustrative amounts, not a tax engine.
- **Order snapshots:** orders retain product and delivery details so purchase history can show what was ordered even after catalogue or profile changes.
- **Duplicate checkout handling:** a unique `checkoutKey` index and upserts let repeated submissions reuse an order. Bag checkout and quick checkout use different key strategies. Order creation and bag updates are separate database operations, not a multi-document transaction.
- **Access boundaries:** customers see their own orders; administration routes check the account's role. Passwords are hashed and sessions are stored in MongoDB.
- **Reporting scope:** the default report includes successful simulated payments, not real revenue. Legacy orders are inspected separately. Profit, refunds, conversion rates, and abandoned carts are not tracked.
- **Currency boundaries:** reference rates are cached server-side for an hour. The display can use stale cached quotes when the provider is unavailable, or fall back to MYR when no quote is available. Converted display values do not change saved checkout amounts or reports.
- **Persistent presentation settings:** homepage content and the shared site theme are stored in MongoDB rather than browser-only state.

## Repository layout

```text
app.js                   Express setup, sessions, static assets, database startup
routes/                  Storefront, account, checkout, and administration routes
controllers/             Request handling and view data
middleware/              Authentication, profile checks, validation, and uploads
models/                  Users, products, orders, homepage, and appearance
services/                Payment simulation, reporting, themes, currency, and hero logic
views/                   EJS pages and reusable layouts
public/javascripts/      Browser interaction and chart code
public/stylesheets/      Layout, responsive styles, and theme presets
public/vendor/chartjs/   Locally served chart library and license
scripts/seed.js          Repeatable fictional product catalogue
compose.yaml             Local MongoDB container and persistent volume
.env.example             Local configuration template
```

## Scripts

| Command                | Purpose                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run dev`          | Start the application with Node's watch mode.                        |
| `npm start`            | Start the application without watch mode.                            |
| `npm run start-server` | Alias for the normal application start command.                      |
| `npm run seed`         | Insert missing fictional demo products into the configured database. |

## Current limitations

- **Demo payments only.** No real payment processing, provider webhooks, refunds, inventory reservation, or shipping integration is implemented.
- **Legacy password reset.** Reset routes exist, but their email transport still contains hard-coded credentials and localhost reset links. Replace those credentials with environment-based configuration, rotate any exposed credential, and configure the application origin before enabling that flow outside a local demo. The current `.env.example` does not configure SMTP.
- **Legacy dependencies.** Several dependencies come from the original implementation and need review and upgrades before a public production deployment.
- **Local-first configuration.** Setting `NODE_ENV=production` does not set up HTTPS, deployment, or production session-cookie policies. Those need separate configuration.

## Bundled assets

Chart.js is distributed locally with its [MIT license](public/vendor/chartjs/LICENSE.md). Plus Jakarta Sans is served locally with its [SIL Open Font License](public/fonts/plus-jakarta-sans/OFL.txt). See the respective asset directories for upstream source information.
