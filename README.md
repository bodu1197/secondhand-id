# SecondHand.id

## Project Overview
SecondHand.id is a C2C second-hand trading platform for the Indonesian market. It allows users to buy and sell used goods directly with each other. The platform is designed to be a web-first, responsive application, with plans for a mobile app in the future. The primary language for the platform is Bahasa Indonesia.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (with App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Management**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Framework**: Next.js API Routes
- **Database Client**: Supabase JavaScript Client
- **Authentication**: Supabase Auth
- **Realtime Chat**: Supabase Realtime
- **Image Storage**: Supabase Storage
- **Serverless Functions**: Netlify Functions

### Database
- **Main DB**: Supabase PostgreSQL
- **Schema Management**: Supabase Dashboard SQL Editor
- **Security**: Row Level Security (RLS) is enforced.

### Deployment
- **Hosting**: Netlify
- **Database & Services**: Supabase

---

## Getting Started

**개발 워크플로우:** 프로젝트는 먼저 로컬 개발 환경에서 기능을 구현하고 테스트한 후, Netlify를 통해 실제 서비스로 배포됩니다.

### 1. Supabase Setup
1.  Create a new project on [Supabase](https://supabase.com/).
2.  Set the region to Singapore.
3.  Use the SQL Editor in the Supabase dashboard to run the schema scripts provided in `프로젝트 개발 계획서 .txt`. This will create the necessary tables (`users`, `listings`, `chats`, `messages`, `reviews`, `reports`) and enable required extensions.
4.  Configure Supabase Auth, enabling Phone Sign-in.
5.  Create a public storage bucket named `listings-images` for image uploads.
6.  Copy the Supabase URL and API keys into a `.env.local` file in your project root.

### 2. Netlify Setup
1.  Create a new GitHub repository for the project.
2.  Connect the repository to a new site on [Netlify](https://app.netlify.com/).
3.  Set the build command to `npm run build` and the publish directory to `.next`.
4.  Add the Supabase environment variables to your Netlify site settings.
5.  Deploy the site.

---

## Key Features
- User authentication via phone number (SMS verification).
- Create, Read, Update, and Delete (CRUD) operations for product listings.
- Real-time chat between buyers and sellers.
- User profiles with ratings and reviews.
- Advanced search and filtering for listings (by category, price, location, etc.).
- A reporting system for users and listings.
- An admin dashboard for platform management.
