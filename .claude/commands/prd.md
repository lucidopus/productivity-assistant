You are an AI assistant tasked with creating well-structured tasks for feature requests, bug reports, or improvement ideas. Your goal is to turn the provided feature description into a comprehensive task that follows best practices and project conventions.

First, you will be given a feature description, with some optional guidance on implementation. Here it is:
<feature_description>
$ARGUMENTS
</feature_description>

Follow these steps to complete the task, make a todo list and think ultrahard:

1.  Research the repository:
    - First, use parallel subagents to find and read all files that may be useful for implementing the task, either as examples or as edit targets. The subagents should return relevant file paths, and any other info that may be useful.  Consider code, documentation, and existing github issues.
2.  Research best practices:
    - If the task is a complex but common problem that might have useful reference code, use parallel subagents to search the web for examples of how similar problems were solved elsewhere, including popular open-source projects or sample code.  For example, you might search for "realtime voice API in react sample code".  Do NOT search for highly specific tasks that are unlikely to yield useful results.  For example, "best practices implementing custom qualification criteria filtering ATS recruiting software" is NOT likely to find anything useful, so skip this step rather than make useless searches.
3.  Present a plan:
    - Next, think hard and write a detailed implementation plan. 
    - Focus on clarity, completeness, and actionability.
    - Don't forget to include tests, lookbook components, and documentation
    - If there are things you still do not understand or questions you have for the user, pause here to ask them before continuing.
4.  Create the task draft:
    - Once the plan is approved, draft the task content in Markdown.
    - Include a clear title, detailed description, acceptable criteria, and any additional context or resources that would be helpful for developers.
    - Remember to think carefully about the feature description and how to best present it as a task. Consider the perspective of both the project maintainers and potential contributors who might work on this feature.
    - Save the task draft as a new .md file in /tasks/new/.  Name the file as [BUG/FEATURE/ETC:]brief-description.md
5.  Ask Gemini to review your task:
    - After your task .md file has been created, use the CLI to ask gemini to review your plan and provide comments like this:
    ```
cd /Users/harshil/Stevens/Projects/NextJS/shopping-platform && gemini -p "@task/new/your-plan.md Act as a senior engineering manager. Review this plan thoroughly, researching my files and database as necessary.  Provide a concise report of any problems, opportunities to improve to align with best practices, codebase conventions, modularity, or simplicity."
    ```
    - Review the response, consider it carefully, and discuss whether you agree or disagree. 
    - Only after reaching a conclusion, edit the .md task with any final changes to your plan.
6.  Write a title and then create the github issue using  `gh issue create --title "Your Issue Title" --body-file /Users/harshil/Stevens/Projects/NextJS/shopping-platform/tasks/new/your-file.md`
7. Assign a Type tag based on /TAGS.md
8.  Move the .md file to /tasks/github-issue-created/

Reminder: you are not completing this task, you are simply creating a detailed plan as a github issue.