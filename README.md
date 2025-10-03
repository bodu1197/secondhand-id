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
6.  Create a public storage bucket named `avatars` for user profile pictures.
7.  Copy the Supabase URL and API keys into a `.env.local` file in your project root.

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
- **회원가입 페이지 (`/auth/register`)**:
  - 이메일, 이름, 비밀번호, 비밀번호 확인 입력 필드 제공.
  - 비밀번호 규칙 (최소 8자, 3가지 종류의 문자 조합) 실시간 검사 및 시각적 피드백.
  - 비밀번호와 비밀번호 확인 일치 여부 실시간 검사 및 피드백.
  - Supabase를 통한 이메일 기반 회원가입 및 사용자 정보 저장.

---

## Troubleshooting

### Tailwind CSS Not Applied

If you are experiencing an issue where Tailwind CSS styles are not being applied, it could be due to an incorrect PostCSS configuration, especially when using Tailwind CSS v4+ with Next.js.

**Symptoms:**
- CSS styles are not applied, and the page appears unstyled.
- A red box added for debugging purposes does not appear.

**Root Cause:**
1.  **Incorrect PostCSS Configuration:** The project might have conflicting PostCSS configuration files (e.g., `postcss.config.js` and `postcss.config.mjs`). For Tailwind CSS v4+, you should use a single `postcss.config.mjs` file.
2.  **Outdated Tailwind CSS Directives:** The `globals.css` file might be using the old `@tailwind` directives (`@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`). In Tailwind CSS v4+, you should use `@import "tailwindcss";` instead.

**Solution:**
1.  **Ensure you have a single `postcss.config.mjs` file** in the root of your project with the following content:
    ```javascript
    const config = {
      plugins: {
        "@tailwindcss/postcss": {},
      },
    };
    export default config;
    ```
2.  **Update your `app/globals.css` file** to use the new `@import` directive:
    ```css
    @import "tailwindcss";

    /* ... rest of your css ... */
    ```
3.  **Restart the development server** after making these changes.