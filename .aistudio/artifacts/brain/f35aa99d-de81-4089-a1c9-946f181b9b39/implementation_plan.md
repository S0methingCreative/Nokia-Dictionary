# GitHub Deployment Quick Reference (For Later)

No rush at all! You can do this whenever you are ready. This document is saved here as a quick reference whenever you decide to revisit hosting.

---

## Direct Answer: Jekyll vs. Static HTML?

If GitHub ever asks you to choose between templates on screen:
- **Do NOT choose Jekyll**: Jekyll is for Ruby Markdown blogs. It cannot compile React/Vite code.
- **Between the two, Static HTML is closer**, BUT **you don't even need to pick either one!**

### Why you don't need to pick a template:
We already added the complete deployment file inside your repository at **`.github/workflows/deploy.yml`**.

When you push this repository to GitHub and switch the Pages source to **GitHub Actions**, GitHub will automatically see that file and run the build for you without you having to configure or pick any template.

---

## When You're Ready Later: The Only 2 Clicks

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Update Nokia Dictionary"
   git push origin main
   ```
2. **In your GitHub repo**:
   - Go to **Settings** → **Pages** (under the left menu).
   - Under **Build and deployment → Source**, change the dropdown to **GitHub Actions**.
   - If GitHub shows template cards, you can simply ignore them or go to the **Actions** tab to see your `Deploy to GitHub Pages` workflow running.
3. Your live link will be:
   **`https://s0methingcreative.github.io/Nokia-Dictionary/`**
