# Copilot instructions

Project context Copilot should apply to every session in this repository.

## Stack

- Framework: Astro (static output).
- Language: TypeScript.
- Styling: plain CSS in the base layout.

## Conventions

- Keep components small and focused.
- Prefer semantic HTML and accessible markup.
- Do not close, or add closing keywords for, the exercise walkthrough issue (issue #1) in any pull request. The exercise's GitHub Actions workflows manage that issue. When you open a pull request for app work, link only the specific app work-item issue you are implementing.

## Persistence and hydration rules

**Persistence**: Bookmarks are persisted in the browser using `localStorage`. Each bookmark stores the original URL and a locally generated short slug.

**Hydration**: Browser-only code that accesses `localStorage` must run behind Astro's `client:load` directive. This ensures the static build process never touches browser APIs. Components that interact with bookmarks should import and use `localStorage` only within client-side boundaries (e.g., in event handlers or lifecycle hooks marked with `client:load`).
