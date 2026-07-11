# AGENTS.md

## Stack

- Next.js 16+ (App Router, SSR mode)
- TypeScript (strict)
- Tailwind CSS
- tailwind-merge
- React Hook Form + Zod
- BetterAuth
- Drizzle ORM
- pnpm

---

> **Note:** Code examples are simplified for illustration. Refer to the actual codebase for real implementations.

## Directory Structure

```
/src
  /app
    /(auth)                    # Auth routes (login, register, etc.)
    /(main)                    # Main app routes
    /actions                   # Server actions (thin entry points)
  /components
    /shared                    # Reusable UI (Button, Input, Card)
    /[feature]                 # Feature-specific components
  /hooks                       # Client-side state logic (forms, optimistic updates)
  /services                    # Business logic (validation, authorization, transforms)
  /repositories                # Data access layer (Drizzle queries)
  /schemas                     # Zod validation schemas
  /auth                        # BetterAuth configuration
  /db                          # Drizzle schema + migrations
  /utils                       # Pure helper functions
  /types                       # Shared TypeScript type definitions
```

---

## Architecture Overview

```
Component
  ↓ (calls)
Server Action (entry point)
  ↓ (delegates to)
Service (business logic)
  ↓ (queries via)
Repository (data access)
  ↓ (executes via)
Database (Drizzle)
```

### Layer Responsibilities

| Layer           | Responsibility                            | Server/Client |
| --------------- | ----------------------------------------- | ------------- |
| `/components`   | UI rendering, event handlers              | Client        |
| `/hooks`        | Client-side state (forms, optimistic)     | Client        |
| `/app/actions`  | Thin entry points, input validation       | Server        |
| `/services`     | Business logic, authorization, transforms | Server        |
| `/repositories` | Data access (Drizzle queries)             | Server        |
| `/schemas`      | Zod validation schemas                    | Both          |
| `/db`           | Drizzle schema, migrations                | Server        |

---

## Boundary Rules

### 1. Server-First Pattern

```
Component → Server Action → Service → Repository → Database
```

- Components call server actions, never directly call services or repositories
- Server actions are thin: validate input, call service, return result
- Services contain business logic, no direct database access
- Repositories contain Drizzle queries, no business logic

### 2. Server Actions = Entry Points

Server actions handle input validation and delegate to services.

```typescript
// app/actions/user.ts
"use server";

import { createUser } from "@/services/user";
import { createUserSchema } from "@/schemas/user";

export const createUserAction = async (data: unknown) => {
  const parsed = createUserSchema.parse(data);
  return createUser(parsed);
};
```

**Rule:** Server actions are thin. No business logic here — just validation and delegation.

### 3. Service Layer = Business Logic

Services contain all business rules, authorization checks, and data transformations.

```typescript
// services/user.ts
import { findUserByEmail, insertUser } from "@/repositories/user";
import type { CreateUserInput } from "@/schemas/user";

export const createUser = async (data: CreateUserInput) => {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new Error("User already exists");
  }

  // Business logic: normalize email, set defaults, etc.
  const normalizedEmail = data.email.toLowerCase();

  return insertUser({ ...data, email: normalizedEmail });
};
```

**Rule:** Services call repositories, never Drizzle directly.

### 4. Repository Layer = Data Access

Repositories wrap Drizzle queries. No business logic, no authorization.

```typescript
// repositories/user.ts
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const findUserByEmail = async (email: string) => {
  return db.query.users.findFirst({ where: eq(users.email, email) });
};

export const insertUser = async (data: typeof users.$inferInsert) => {
  return db.insert(users).values(data).returning();
};
```

**Rule:** One concern per repository method. Complex queries can be composed.

### 5. Component Layer = UI Only

Components handle rendering and user interaction. They call server actions for mutations and use hooks for client-side state.

```typescript
// components/user/CreateUserForm.tsx
"use client";

import { useAction } from "next-safe-action";
import { createUserAction } from "@/app/actions/user";

export function CreateUserForm() {
  const { execute, isPending } = useAction(createUserAction);

  const handleSubmit = (data: FormData) => {
    execute(Object.fromEntries(data));
  };

  return (
    <form action={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>Create</button>
    </form>
  );
}
```

**Rule:** Components never import from `/services` or `/repositories`.

### 6. Hooks Layer = Client-Side State

Hooks manage client-side state that doesn't belong in server actions: form state, optimistic updates, UI state.

```typescript
// hooks/useOptimisticTodos.ts
"use client";

import { useOptimistic } from "react";

export const useOptimisticTodos = (initial: Todo[]) => {
  const [optimistic, addOptimistic] = useOptimistic(initial, (state, newTodo: Todo) => [
    ...state,
    newTodo,
  ]);

  return { optimistic, addOptimistic };
};
```

**Rule:** Hooks are for client-side concerns only. Server state goes through server actions → services.

### 7. Schema Layer = Validation

Schemas define validation rules used by both server actions and client forms.

```
/schemas
  user.ts              # User-related schemas
  product.ts           # Product-related schemas
  index.ts             # Re-exports
```

```typescript
// schemas/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

**Rule:** Export both schema and inferred type. Server actions use schema for validation, components use type for form handling.

---

## Naming Conventions

| Item             | Convention                   | Example                 |
| ---------------- | ---------------------------- | ----------------------- |
| Components       | PascalCase                   | `CreateUserForm.tsx`    |
| Hook files       | camelCase, `use` prefix      | `useOptimisticTodos.ts` |
| Service files    | camelCase, singular resource | `user.ts`               |
| Repository files | camelCase, plural resource   | `users.ts`              |
| Schema files     | camelCase, resource name     | `user.ts`               |
| Action files     | camelCase, verb + resource   | `createUser.ts`         |
| Type files       | camelCase                    | `user.ts`               |
| Utility files    | camelCase                    | `formatCurrency.ts`     |

---

## TypeScript

- Strict mode, no `any`, no `unknown` escape hatches
- Use `import type` for type-only imports
- Props: `type FooProps = { ... }` at top of file
- Interfaces for data shapes, type aliases for props/unions
- Path alias `@/*` → `./src/*`
- Export types from `/types` or co-located in schema files

---

## Imports Order

```typescript
// 1. External packages
import { useState } from "react";
import { eq } from "drizzle-orm";

// 2. @/ alias imports
import { db } from "@/db";
import { createUserSchema } from "@/schemas/user";

// 3. Relative imports
import { Button } from "./Button";
```

---

## Styling

- Tailwind CSS utility classes only
- No inline styles, no CSS modules
- Responsive: `sm:` / `md:` / `lg:` breakpoints
- Use `tailwind-merge` for conditional classes when complex
- Prefer native HTML elements + Tailwind over component libraries

---

## Adding New Features

### New Feature (e.g., products)

1. Create `/db/schema/product.ts` — Drizzle schema
2. Create `/schemas/product.ts` — Zod validation
3. Create `/repositories/products.ts` — data access
4. Create `/services/product.ts` — business logic
5. Create `/app/actions/product.ts` — server actions
6. Create `/components/products/` — UI components
7. Run `pnpm db:generate` to update migrations

---

## What This File Can't Cover

This file defines conventions. For edge cases:

1. **Domain logic** — complex business rules go in `/services`, document in code comments
2. **State management** — server state via server actions, UI state via hooks, local state via useState
3. **Error boundaries** — add as needed per page
4. **Performance** — memoization, code splitting per use case
5. **Accessibility** — follow WCAG basics, add ARIA as needed
6. **Migration** — when refactoring, keep old + new parallel until tests pass

**Rule of thumb:** If you're unsure, check existing code in the same directory. Conventions are enforced by example, not by exhaustive documentation.
