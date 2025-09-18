+++
[meta]
version = "1.0"
purpose = "Generate commit messages and run pre-commit quality checks for the RecruitMagic monorepo (Git/GitHub)"
+++

# RecruitMagic Commit Quality Gate & Message Generator

You are an expert software engineer responsible for crafting clear, descriptive commit messages _and_ ensuring every commit that lands on `master` passes the baseline quality gates for the RecruitMagic monorepo (see `docs/architecture/monorepo_workspaces.md`).

## Required Validation Workflow

> Execute **all** steps below **in order** USING SUBAGENTS. Abort if any step fails.

1. **Ensure critical folders are gitignored**
   ```bash
   # Add these folders to .gitignore if not already present
   echo ".claude/" >> .gitignore
   echo "tasks/" >> .gitignore  
   echo "docs/" >> .gitignore
   # Remove duplicates and sort
   sort .gitignore | uniq > .gitignore.tmp && mv .gitignore.tmp .gitignore
   ```

2. **Working tree overview**
   ```bash
   git status
   ```
3. **Static analysis – ESLint**
   ```bash
   npm run lint
   ```
4. **Type safety – TypeScript project references**
   ```bash
   npm run type-check
   ```
5. **Build verification**
   ```bash
   npm run build -w loveable            # main web workspace
   # Add additional -w <workspace> flags if other workspaces contain build scripts
   ```
6. **Diff review**
   ```bash
   git diff --staged
   ```
7. **History style reference**
   ```bash
   git log --oneline -n 10
   ```

Only proceed to commit when steps 3–5 exit with status code 0 and there are no linter/type errors.

## Commit Message Format

```
<short imperative title>

<concise explanation of WHAT changed and WHY>

Changes:
- <bullet describing change>
- <another change>
- ...

Test plan:
1. <manual or automated verification steps>
2. ...

```

### Title Guidelines

- 50–72 chars, present-tense imperative (Add, Fix, Remove, Refactor …)
- No trailing period
- Mention user-visible impact when possible
- Omit author information (ie don't mention Claude Code)

### Attribution Guidelines

- DO NOT include Claude Code attribution lines like "🤖 Generated with Claude Code" or "Co-Authored-By: Claude"
- Keep commit messages clean and professional without AI attribution

### Body Guidelines

- Focus on motivation and impact rather than line-by-line detail
- Reference related tasks/PRs by link when available
- If multiple logical changes detected, stop and recommend separate commits

## Committing

## After carefully reviewing all uncommitted modified files (both staged and unstaged), git add ONLY the files that you modified. Then commit with your message.

## Post-Commit Step

After the commit is successfully created, IMMEDIATELY comment out the gitignored folders:

```bash
# Comment out the folders in .gitignore after commit
sed -i.bak 's/^\.claude\/$/# .claude\//' .gitignore
sed -i.bak 's/^tasks\/$/# tasks\//' .gitignore  
sed -i.bak 's/^docs\/$/# docs\//' .gitignore
rm .gitignore.bak
```

Follow these rules rigorously; failing validations is grounds to halt the commit until fixed. If any lint, type, or build checks fail, immediately proceed to fix the errors.
