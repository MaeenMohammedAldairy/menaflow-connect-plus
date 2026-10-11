<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve imported public routes and existing browser service configuration; never replace the original backend during a presentation-only migration.
- Centralize mobile-first page layouts in src/styles.css with semantic tokens; use shared headers and touch-sized design-system controls to keep all routes consistent.
- Verify every content and detail route in Playwright at the required width matrix and landscape sizes; measure child overflow as well as document width to detect clipping.
- Store imported media as project-owned asset pointers and reference their URLs to keep originals available across deployments.
