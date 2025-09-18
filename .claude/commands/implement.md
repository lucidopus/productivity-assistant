Implement the github issue $ARGUMENTS.

1. Fetch the issue with comments `gh issue view $ARGUMENTS --json title,body,comments`
2. Review the issue carefully, think ultra hard, and then implement the fix carefully as described. If anything is unclear about how to proceed, stop here and ask the user for feedback.
3. After you've completed your fix, use parallel subagents to test your solution carefully using:

- `npm run build` (builds loveable)
- `npm run lint` (lints entire monorepo)
- `npm run type-check` (checks TypeScript across monorepo)


4. When you believe you are done, STOP and notify the user and wait for manual testing.
5. Once the user has tested and confirmed everything works, only then comment and close the github issue using: `gh issue close $ARGUMENTS --comment "Your closing comment here"`. If there's a problem, just comment the issue without closing.
6. Move the github issue document for this issue in tasks/github-issue-created over to tasks/completed once the manual testing is done and the user is satisfied with the implementation.
