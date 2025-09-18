# /enhance-plan Command

## Purpose
Transform raw project ideas and plans into well-structured, clear documents ready for deep research and technical implementation.

## Command Syntax
```
/enhance-plan <raw plan description>
```

## What This Command Does

When invoked, this command should:

1. **Take the raw, unstructured plan** - however rough or stream-of-consciousness it may be

2. **Refine it into a clear, structured document** that:
   - Removes technical jargon and implementation details
   - Focuses on the core vision, problem, and desired experience
   - Uses clear, personal language that explains what you want to build
   - Preserves any specific platform/tool requirement specification mentioned in the raw plan (like use only a specific technology)
   - Organizes thoughts into logical sections
   - Emphasizes the human experience and benefits

3. **Save the refined plan** to `docs/PROJECT_PLAN.md` directory with an appropriate filename

4. **Prepare it for deep research** - The output will be perfect for feeding to a research agent or LLM that can then create the technical blueprint

## Key Principles

- **No technical assumptions**: Avoids prescribing databases, architectures, or technical solutions
- **User-centric language**: Written from the user's perspective, often in first person
- **Problem-focused**: Clearly articulates the problem being solved
- **Experience-driven**: Describes how the solution should feel and work from the user's perspective
- **Specification preservation**: Maintains any specific requirements mentioned 

## Output Format

The enhanced plan will include sections like:
- What I Want to Build
- The Core Problem
- How It Will Work
- The Experience I Want
- Essential Requirements
- Success Metrics
- The Bigger Picture

## Example Usage

```
/enhance-plan I want to build an AI that helps me wake up on time. It should know my sleep patterns and gradually adjust my alarm based on when I actually get up vs when I planned to. Maybe it could connect to my smart lights and gradually brighten them. Should text me motivational messages.
```

This will transform the rough idea into a comprehensive, well-structured plan document ready for technical implementation planning.
