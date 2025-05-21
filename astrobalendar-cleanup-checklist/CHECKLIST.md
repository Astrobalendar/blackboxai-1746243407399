# Astrobalendar Project Cleanup Checklist

## 📦 1. File & Structure Cleanup

### 🔹 Run Project Audit
- [ ] Run the TypeScript audit script (`check-unused-and-duplicates.ts`) to:
  - Identify duplicate files like `App.tsx`, `App.new.tsx`
  - Detect unused components in `/src/components/`, `/pages/`, `/layouts/`

### 🔹 Remove Junk Files
- [ ] Use the terminal to delete:
  find src -type f \( -name "*.new.tsx" -o -name "*.bak.tsx" -o -name "*.test.tsx" \) -delete
- [ ] Delete or archive unused files found in audit
- [ ] Check and clean up `App.tsx` if not connected to the router

## 🗂️ 2. Routing & Entry Point Consistency

### 🔹 Centralize Routing via `Routes.tsx`
- [ ] Ensure `main.tsx` loads only `Routes.tsx`, not `App.tsx`
- [ ] In `Routes.tsx`, verify structure:
  import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
  function AppRoutes() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="kp-astrology" element={<KPAstrologyPage />} />
            <Route path="horoscope/new" element={<NewHoroscopePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }
  export default AppRoutes;
- [ ] Ensure `Outlet` from `react-router-dom` is used in layout components (e.g., `DashboardLayout`).
- [ ] Remove redundant or nested `<Routes>` inside other components.

## 🔄 3. Fix Common Runtime Errors

### ❗ `PlusIcon` Not Defined
- [ ] Replace `PlusIcon` with:
  import { Plus } from 'lucide-react';

### ❗ Google Maps Error
- [ ] Update `VITE_GOOGLE_MAPS_API_KEY` in `.env` file.
- [ ] Enable correct domain in Google Cloud Console for the API key.

### ❗ 404 from Horoscope API
- [ ] Check backend `/horoscope/:id` route implementation and deployment.
- [ ] Confirm correct base API URL is set in the frontend `.env` file.
- [ ] Deploy or restart Render backend if needed.

## 🧪 4. Test Each Feature Manually

| Feature         | Route             | Tests                                     |
|-----------------|-------------------|-------------------------------------------|
| Login           | `/login`          | Login with valid + invalid credentials    |
| Horoscope Entry | `/horoscope/new`  | Fill form, validate, check for duplicates |
| Prediction View | `/prediction/:id` | Test chart data load, UI elements         |
| KP Astrology    | `/kp-astrology`   | Check chart render, tooltips, interactions|
| Navigation      | `/dashboard`, `/calendar`, etc. | Test mobile + desktop navigation links |

## 🧼 5. Polish the Codebase

- [ ] Run `npx tsc --noEmit` to verify type safety.
- [ ] Run `eslint . --fix` to auto-correct lint issues.
- [ ] Verify all `.module.css` files are correctly scoped and used as intended.
- [ ] Remove unused imports/variables/components manually flagged in audit or by linters/IDE.

## 🚀 6. Final Deployment Steps

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Netlify
- [ ] Auth/Data connected via Firebase
- [ ] Set/Verify environment variables in both Netlify (frontend) and Render (backend) platforms:
  - `VITE_API_URL` (frontend)
  - `VITE_GOOGLE_MAPS_API_KEY` (frontend)
  - `FIREBASE_...` (frontend, and backend if needed)
  - Any backend-specific variables (e.g., database URLs, API keys for backend services)
- [ ] Open site: `https://astrobalendar.com` (or your production URL)
  - [ ] Verify no white screens or console errors on major pages.
  - [ ] Test KP chart rendering and core functionalities.

## 📁 Optional Extras

- [ ] Add/Update `README.md` with tech stack, setup, and deployment guide.
- [ ] Create or update `/.vscode/settings.json` to enforce formatting standards.
- [ ] Consider using GitHub Actions for CI (run tests, lint, build before deploy).