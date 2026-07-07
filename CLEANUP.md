Cleanup and recommended removals
===============================

Changes applied here:
- Added ignore rules to `.gitignore` to exclude build artifacts, editor files and local test payloads.
- Removed `token.txt` from the workspace (sensitive/test token).
- Removed `backend-worker/target/` build artifacts.

Recommended further actions (pick one):

1) Archive Node prototypes (safe, preserves history):

   mkdir -p archive
   git mv backend archive/backend-node-prototype
   git mv worker archive/worker-node-prototype
   git commit -m "Move Node prototypes to archive/"

2) Or remove prototypes if you no longer need them:

   git rm -r backend worker
   git commit -m "Remove legacy Node prototypes"

3) Remove other test payloads or sensitive files (if not needed):

   git rm publish.json auth-register.json
   git commit -m "Remove test payloads"

4) Ensure build artifacts are not tracked and remove cached ones:

   git rm -r --cached **/target || true
   git add .gitignore
   git commit -m "Ignore Maven/JS build artifacts"

Notes:
- I did not remove `backend/` or `worker/` automatically to avoid accidental data loss — prefer `git mv` to `archive/` so history is preserved.
- If you want I can perform the archive or delete steps for you.
