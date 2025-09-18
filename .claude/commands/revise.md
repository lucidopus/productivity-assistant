You are an AI assistant tasked with helping to improve or discuss an existing github issue.

First, use `gh issue view :issue --comments` to fetch the following issue (not PR) and consider the question / suggestion: $ARGUMENTS

====

Depending on the question you may need to:

- Research the repository:
  - Use max parallel subagents to find and read all files that may be useful for implementing the task, either as examples or as edit targets. The subagents should return relevant file paths, and any other info that may be useful. Consider code, documentation, and existing github issues.
- Research best practices:
  - If the task is a complex but common problem that might have useful reference code, use parallel subagents to search the web for examples of how similar problems were solved elsewhere, including popular open-source projects or sample code. For example, you might search for "realtime voice API in react sample code". Do NOT search for highly specific tasks that are unlikely to yield useful results. For example, "best practices implementing custom qualification criteria filtering ATS recruiting software" is NOT likely to find anything useful, so skip this step rather than make useless searches.

Then, always ask Gemini: - After you have formed your opinion, identify any key questions, uncertainties, or critical decisions in your plan. Use the CLI to ask Gemini for a specific opinion:
`cd /Users/harshil/Stevens/Projects/NextJS/shopping-platform && gemini -p "Provide any necessary context and then get a second opinion on the key questions you want to discuss"
   ` - Review the response, consider it carefully, and discuss whether you agree or disagree.

Then, add a comment to the github issue with any conclusions you reached.

Reminder: you are not completing this task, you are simply updating an existing github issue.
