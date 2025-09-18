You are an AI assistant tasked with creating a github issue after improving an existing task file.

First, fetch the task file $ARGUMENTS

Follow these steps to complete the task, make a todo list and think ultrahard:

1.  Research the repository:
    - First, use max parallel subagents to find and read all files that may be useful for implementing the task, either as examples or as edit targets. The subagents should return relevant file paths, and any other info that may be useful. Consider code, documentation, and existing github issues.
2.  Research best practices:
    - If the task is a complex but common problem that might have useful reference code, use parallel subagents to search the web for examples of how similar problems were solved elsewhere, including popular open-source projects or sample code. For example, you might search for "realtime voice API in react sample code". Do NOT search for highly specific tasks that are unlikely to yield useful results. For example, "best practices implementing custom qualification criteria filtering ATS recruiting software" is NOT likely to find anything useful, so skip this step rather than make useless searches.
3.  Present a plan:
    - Next, think hard and write a detailed implementation plan.
    - Focus on clarity, completeness, and actionability.
    - Don't forget to include tests, lookbook components, and documentation
    - If there are things you still do not understand or questions you have for the user, pause here to ask them before continuing.
4.  Create the task draft:
    - Once the plan is approved, update the task content with your learnings and improvements, if any.
5.  Ask Gemini to review your task: - After your task .md file has been created, use the CLI to ask gemini to review your plan and provide comments like this:
    `cd /Users/harshil/Stevens/Projects/NextJS/shopping-platform && gemini -p "$ARGUMENTS Act as a senior engineering manager. Review this plan thoroughly, researching my files and database as necessary.  Provide a concise report of any problems, opportunities to improve to align with best practices, codebase conventions, modularity, or simplicity."
` - Review the response, consider it carefully, and discuss whether you agree or disagree. - Only after reaching a conclusion, edit the .md task with any final changes to your plan.
6.  Write a title and then create the github issue using `gh issue create --title "Your Issue Title" --body-file /Users/harshil/Stevens/Projects/NextJS/shopping-platform/tasks/.../your-file.md`
7.  Assign a Type tag based on /TAGS.md
8.  Move the .md file to /tasks/github-issue-created/

Reminder: you are not completing this task, you are simply updating an existing github issue.
