Continue working on the github issue $ARGUMENTS.

1. Fetch the issue `gh issue view ... --comments` and all comments.
2. Review the issue carefully, think ultra hard, and then implement the fix carefully as described. If anything is unclear about how to proceed, stop here and ask the user for feedback.
3. After you've completed your fix, use parallel subagents to test your solution carefully using:

- `npm run build` (builds loveable)
- `npm run lint` (lints entire monorepo)
- `npm run type-check` (checks TypeScript across monorepo)
- integration tests if available (ie for edge functions)
- e2e tests If it is likely that your change will have impacted the web app (see /loveable/e2e/e2e-README.md for details)

4. When the user has confirmed we are all done, comment and close the github issue if not already closed.
