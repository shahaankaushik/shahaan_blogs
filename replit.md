# Shahaan's Personal Blog

## Overview

A personal blog application with a lo-fi anime aesthetic built using React frontend and Express backend. The blog features posts with likes and comments, editable blog info sections, and Replit Auth integration for admin functionality. The visual design uses a dark purple/neon cyan color scheme with the "Architects Daughter" handwritten font for a casual, personal feel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Animations**: Framer Motion for smooth transitions and animations
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js native http module wrapping Express
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Development**: tsx for TypeScript execution, Vite middleware for HMR

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: shared/schema.ts defines all tables
- **Tables**: users, sessions (for auth), posts, comments, blog_info
- **Migrations**: Drizzle Kit with push command for schema sync

### Authentication
- **Method**: Replit OpenID Connect (OIDC) authentication
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **Implementation**: Passport.js with custom OIDC strategy in server/replit_integrations/auth/

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including shadcn/ui
    hooks/        # Custom React hooks (use-auth, use-blog, etc.)
    pages/        # Route pages (Home, PostDetail)
    lib/          # Utilities and query client
server/           # Express backend
  replit_integrations/auth/  # Replit auth integration
shared/           # Shared code between frontend/backend
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with types
  models/         # Shared model types
```

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: esbuild bundles server, Vite builds client to dist/public
- **Script**: script/build.ts handles full production build

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit OIDC**: OpenID Connect provider at https://replit.com/oidc
- **Environment Variables**: ISSUER_URL, REPL_ID, SESSION_SECRET required

### UI/Styling
- **Google Fonts**: Architects Daughter font loaded from fonts.googleapis.com
- **Background Image**: Lo-fi anime city background from attached_assets

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner for enhanced Replit development experience