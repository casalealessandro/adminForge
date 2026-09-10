# AdminForge API

Neutral demo backend for the AdminForge Angular starter kit.

## Scope

This API intentionally contains only reusable demo domains:

- `users`
- `products`
- `forms`

It has no dependency on Firebase, ComeMiVesto, authentication providers, affiliate catalogs, or application-specific services.

## Stack

- Node.js 20+
- TypeScript
- Express
- PostgreSQL
- `pg` driver with explicit SQL

## Start locally

```bash
cd backend
cp .env.example .env
npm install
docker compose up -d
npm run db:setup
npm run dev
```

Health check:

```bash
curl http://localhost:3000/api/health
```

## REST API

### Users

- `GET /api/users?page=1&pageSize=20&search=demo&sort=lastName&order=asc`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Products

- `GET /api/products?page=1&pageSize=20&search=demo&sort=name&order=asc`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Forms

- `GET /api/forms?page=1&pageSize=20&search=user&sort=name&order=asc`
- `GET /api/forms/:id`
- `POST /api/forms`
- `PUT /api/forms/:id`
- `DELETE /api/forms/:id`

List endpoints return:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

`forms.definition` is stored as PostgreSQL `jsonb` and is designed to contain AdminForge DynamicForm/FormBuilder definitions without making the frontend Core PostgreSQL-aware.

## Demo data

`npm run db:setup` creates the schema and idempotently seeds:

- 100 users
- 150 products
- 3 form definitions

## Architecture boundary

AdminForge Core must never import or depend directly on this backend. The Angular demo application will connect it through provider implementations such as `GridDataProvider` and `FormDefinitionRepository`.

## Security note

This first demo baseline intentionally does not implement authentication. Do not expose write endpoints publicly on the Internet until an authentication/rate-limit strategy is added.
