# Prisma Setup Guide

## Prerequisites

Ensure you have:
- PostgreSQL running locally or accessible
- `.env` file with `DATABASE_URL` configured (copy from `.env.example`)

## First Time Setup

```bash
# 1. Create .env file
cp .env.example .env

# 2. Update DATABASE_URL in .env with your actual database credentials
# Example: postgresql://user:password@localhost:5432/portal_smkn12?schema=public

# 3. Generate Prisma client
npm run db:generate

# 4. Create initial migration (initializes database schema)
npm run db:migrate -- --name init

# 5. Run seeding (populate default data)
npm run db:seed
```

## Common Commands

### Development
```bash
# Create a new migration after schema changes
npm run db:migrate -- --name <migration_name>
# Example: npm run db:migrate -- --name add_user_model

# Seed database with initial data
npm run db:seed

# Reset database (dangerous! ⚠️ - clears all data)
npm run db:reset

# Generate Prisma client (run after manual schema changes)
npm run db:generate
```

### Production
```bash
# Apply pending migrations to production database
npm run db:migrate:deploy

# Verify schema is up to date
npx prisma db pull  # (only in special cases - overwrites schema!)
```

### Debugging
```bash
# Open Prisma Studio (visual database explorer)
npx prisma studio

# Validate schema syntax
npx prisma validate

# Format schema file
npx prisma format
```

## Workflow for Schema Changes

1. **Update `prisma/schema.prisma`** with your new models/fields
2. **Create migration**: `npm run db:migrate -- --name <description>`
3. **Review migration** in `prisma/migrations/` folder
4. **Run migration**: Automatic with `npm run db:migrate` or `npm run db:migrate:deploy` in production
5. **Update seed.ts** if needed for new default data
6. **Run seed**: `npm run db:seed`

## Seeding Best Practices

- Keep seed data **minimal and essential only**
- Use **upsert** operations to make seeds **idempotent** (safe to run multiple times)
- Add **logging** for debugging
- Handle **errors gracefully** with try-catch
- **Update existing data** if needed (not just create)

Current seed operations:
- Sets default `SiteSettings` (site name, visi, misi, contact info)

## Git & Migrations

```bash
# Migrations should ALWAYS be committed to git
git add prisma/migrations/
git commit -m "chore: add migration - <description>"

# DO NOT edit migration files manually - regenerate if needed
# DO NOT commit generated client - add to .gitignore
```

## Troubleshooting

### Seed won't run
- Check `.env` file has `DATABASE_URL`
- Verify database is running and accessible
- Run `npm run db:generate` first
- Check migration status: check if schema matches `prisma/migrations`

### Migration conflicts
- Check `prisma/migrations` folder for conflicting files
- In development: `npm run db:reset` (⚠️ deletes all data)
- In production: manually review and resolve conflicts

### Database URL issues
```bash
# PostgreSQL connection string format:
postgresql://username:password@hostname:port/database?schema=public

# Local development example:
postgresql://postgres:password@localhost:5432/portal_smkn12?schema=public

# With special characters, URL encode them:
# password "p@ss" → "p%40ss"
```

## Environment Variables

Create `.env` file (copy from `.env.example`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/portal_smkn12?schema=public"
NODE_ENV=development
```

**IMPORTANT**: Never commit `.env` file to git!
