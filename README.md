# Business GPT - Local Setup Guide

This is a Next.js application for generating business plans using AI.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- PostgreSQL database (Neon recommended) or local PostgreSQL
- OpenAI API key

## Setup Instructions

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
# Get your connection string from Neon (https://neon.tech) or use a local PostgreSQL instance
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI API Key (required for business plan generation)
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Node Environment
NODE_ENV=development
```

### 4. Set Up Database

Run the SQL scripts to create the required tables:

```bash
# If using Neon or a remote database, connect and run:
psql $DATABASE_URL -f scripts/001-create-tables.sql
psql $DATABASE_URL -f scripts/002-create-messages-table.sql

# Or if you have psql installed locally:
psql -h your_host -U your_user -d your_database -f scripts/001-create-tables.sql
psql -h your_host -U your_user -d your_database -f scripts/002-create-messages-table.sql
```

Alternatively, you can use a database GUI tool like pgAdmin, DBeaver, or the Neon console to execute the SQL scripts:
- `scripts/001-create-tables.sql` - Creates users, business_plans, and sessions tables
- `scripts/002-create-messages-table.sql` - Creates messages table for chat conversations

### 5. Run the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - React components
- `lib/` - Utility functions (database, auth, questions)
- `scripts/` - Database migration scripts
- `hooks/` - React hooks

## Features

- User authentication (signup/login)
- ChatGPT-style conversational interface for creating business plans
- AI-powered business plan generation
- Plan management dashboard
- PDF export functionality

## Troubleshooting

- **Database connection errors**: Verify your `DATABASE_URL` is correct and the database is accessible
- **OpenAI API errors**: Ensure your `OPENAI_API_KEY` is valid and has credits
- **Port already in use**: Change the port by running `pnpm dev -- -p 3001`

