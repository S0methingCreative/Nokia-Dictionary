# Turnkey GitHub Pages Setup for `S0methingCreative/Nokia-Dictionary`

This plan details the exact setup tailored specifically for your existing repository **`https://github.com/S0methingCreative/Nokia-Dictionary/`**.

---

## User Review & Specific Repository Details

> [!IMPORTANT]
> - **Target Repository**: `https://github.com/S0methingCreative/Nokia-Dictionary/`
> - **Live Site URL**: `https://s0methingcreative.github.io/Nokia-Dictionary/`
> - **Action Done By Us**:
>   1. Configure `vite.config.ts` with `base: './'` so all script, style, and font asset paths resolve cleanly under `/Nokia-Dictionary/` with no 404 errors.
>   2. Add the complete GitHub Actions workflow file at `.github/workflows/deploy.yml`.
> - **Only 1 Action Required By You in GitHub**:
>   Visit `https://github.com/S0methingCreative/Nokia-Dictionary/settings/pages` and set **Source** to **GitHub Actions**.

---

## 1. What We Are Implementing in Code

1. **`vite.config.ts`**:
   - Add `base: './'`. This ensures that assets in `dist/index.html` link to `./assets/...` rather than `/assets/...`, making them work automatically at `https://s0methingcreative.github.io/Nokia-Dictionary/`.
2. **`.github/workflows/deploy.yml`**:
   - Create an automated deployment workflow using official GitHub Pages actions (`actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, and `actions/deploy-pages@v4`).
   - Runs automatically on every push to `main` (and can also be triggered manually via "Run workflow").
3. **Build Verification**:
   - Run `compile_applet` to verify clean build generation.

---

## 2. Your Final Step in GitHub

Once the files are committed to your repo:

1. Open your browser to:
   **https://github.com/S0methingCreative/Nokia-Dictionary/settings/pages**
2. Under **Build and deployment → Source**, change the dropdown to **GitHub Actions**.
3. That's it! GitHub will immediately trigger the workflow and publish your site at:
   **`https://s0methingcreative.github.io/Nokia-Dictionary/`**
