Good job, you are done.

Write a detailed summary of your work including:

- what you did
- any major learnings
- the status of the project, including what remains, if anything.

Then, scan uncommited files list and delete any temporary files that you created that are not useful to keep (if any).

Then, git add and commit ONLY the files that you modified (first unstage existing staged files). Include version.json as well. Do not touch any files that you didn't modify yourself (ie do NOT git restore), because others are working in this codebase in parallel.
Include your piped summary in the commit message.

Finally, use a subagent to search for any documentation files that you referenced that were out of date, focusing on project-specific docs. Update them.
Only update Claude.md or other general docs if there is something critical to reference in all future prompts.
