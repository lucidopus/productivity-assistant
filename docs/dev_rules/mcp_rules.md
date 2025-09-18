# MCP Server Creation Rules - Complete Guide

## Overview
This guide provides step-by-step instructions for creating a Model Context Protocol (MCP) server using FastMCP that can be integrated with Gemini. Follow these rules exactly to create a functional MCP server from scratch.

## 1. Project Initialization

### 1.1 Create Project Structure
```bash
# Use uv for Python project management
uv init <server-name>
cd <server-name>
```

### 1.2 Verify Python Version
Ensure `.python-version` contains:
```
3.12
```

## 2. Configure Dependencies

### 2.1 Update pyproject.toml
Add MCP dependency to `pyproject.toml`:
```toml
[project]
name = "<server-name>"
version = "0.1.0"
description = "<Your MCP Server Description>"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "mcp[cli]>=1.13.1"
]
```

### 2.2 Install Dependencies
```bash
uv sync
```

## 3. Server Implementation Structure

### 3.1 Create main.py
Follow this exact structure for `main.py`:

```python
from typing import Dict, List
from pydantic import BaseModel, Field
from mcp.server.fastmcp import FastMCP

# Create the MCP server instance
mcp = FastMCP("<ServerName>")

# Define Pydantic models for structured data
class YourDataModel(BaseModel):
    """Description of your data model."""
    field1: str = Field(description="Description of field1")
    field2: int = Field(description="Description of field2")
    # Add more fields as needed

# Implement MCP tools
@mcp.tool()
def your_tool_name(param1: str, param2: str = "default") -> YourDataModel:
    """Tool description that explains what it does.
    
    Args:
        param1: Description of param1
        param2: Description of param2 (optional)
    """
    # Tool implementation
    # Return data using your Pydantic model
    return YourDataModel(
        field1="value",
        field2=123
    )

# Implement MCP resources (optional)
@mcp.resource("protocol://resource/{param}")
def your_resource_name(param: str) -> str:
    """Resource description."""
    # Resource implementation
    return "Resource content as string"

# Entry point
def main():
    """Run the MCP server."""
    mcp.run()

if __name__ == "__main__":
    main()
```

## 4. Implementation Best Practices

### 4.1 Data Models
- **Always use Pydantic models** for structured output
- **Include Field descriptions** for each field
- **Create separate models** for different data structures (e.g., SingleItem vs ListOfItems)

### 4.2 Tool Implementation
- **Use @mcp.tool() decorator** for all tools
- **Provide clear docstrings** with Args descriptions
- **Set default values** for optional parameters
- **Return Pydantic models** or simple types (str, int, dict, list)

### 4.3 Resource Implementation (Optional)
- **Use @mcp.resource() decorator** with URI pattern
- **Return string content** for resources
- **Use meaningful URI schemes** (e.g., `protocol://type/{identifier}`)

### 4.4 Error Handling
- **Provide fallback data** for unknown inputs
- **Never raise unhandled exceptions**
- **Return meaningful default values** when data unavailable

## 5. Testing the Server

### 5.1 Local Testing
```bash
# Test if server runs without errors
uv run main.py
```

If no output appears and no errors, the server is ready.

## 6. Claude Code Integration

### 6.1 Installation Method (ALWAYS USE THIS)

**IMPORTANT:** Always use global scope with absolute path to avoid directory issues:

```bash
# ALWAYS use this pattern for MCP server installation
cd /absolute/path/to/your/server
claude mcp add --scope user <ServerName> -- bash -c "cd $(pwd) && uv run main.py"

# This automatically gets the current directory's absolute path
# Example workflow:
cd /Users/username/projects/my-mcp-server
claude mcp add --scope user MyMcpServer -- bash -c "cd $(pwd) && uv run main.py"
```

**Why this approach:**
- **Works from any directory** - no matter where you start Claude Code
- **Automatic path resolution** - `$(pwd)` gets the current absolute path
- **No scope issues** - `--scope user` makes it globally available
- **Consistent behavior** - eliminates path-related connection failures

#### Method C: Using uv run mcp install (MAY HAVE ISSUES)
```bash
# This method may cause connection issues
uv run mcp install main.py
```

### 6.2 Verify Installation
```bash
# Check if server is connected
claude mcp list
```

Expected output:
```
Checking MCP server health...
<ServerName>: uv run main.py - ✓ Connected
```

### 6.3 Test in Claude Code
```bash
# Start Claude Code CLI
claude

# List available MCP tools
/mcp

# Test your tool
<ask a question that would trigger your tool>
```

## 7. Troubleshooting

### 7.1 Connection Failed Error
If `claude mcp list` shows "✗ Failed to connect":

1. **Remove existing installation:**
   ```bash
   claude mcp remove <ServerName>
   ```

2. **Reinstall using the standard method:**
   ```bash
   # Navigate to your server directory and use the standard pattern:
   cd /path/to/your/server
   claude mcp add --scope user <ServerName> -- bash -c "cd $(pwd) && uv run main.py"
   ```

### 7.2 Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "Failed to connect" | Use `claude mcp add` instead of `uv run mcp install` |
| "No MCP servers configured" when changing directories | Use `--scope user` with absolute path for global access |
| Server only works from project directory | Reinstall with `bash -c "cd /absolute/path && uv run main.py"` |
| Virtual environment warnings | Ignore - these are harmless |
| No tools showing in /mcp | Ensure @mcp.tool() decorators are present |
| Server crashes | Check for unhandled exceptions in tool implementations |

### 7.3 Debug Checklist
- [ ] Python version is 3.12+
- [ ] mcp[cli] dependency is in pyproject.toml
- [ ] Dependencies installed with `uv sync`
- [ ] Server has at least one @mcp.tool() decorated function
- [ ] main() function calls mcp.run()
- [ ] Server registered with `claude mcp add` command
- [ ] For global access: Used `--scope user` and absolute path with `bash -c "cd /path && uv run main.py"`

## 8. Example Implementation Pattern

### 8.1 Multiple Tools Pattern
```python
@mcp.tool()
def get_item(id: str) -> ItemModel:
    """Get a single item by ID."""
    # Implementation
    
@mcp.tool()
def list_items(limit: int = 10) -> List[ItemModel]:
    """List multiple items."""
    # Implementation
    
@mcp.tool()
def search_items(query: str) -> List[ItemModel]:
    """Search for items."""
    # Implementation
```

### 8.2 Hardcoded Data Pattern (for prototyping)
```python
# Store test data in dictionaries
test_data = {
    "item1": ItemModel(...),
    "item2": ItemModel(...),
}

@mcp.tool()
def get_item(id: str) -> ItemModel:
    return test_data.get(id, default_item)
```

## 9. Configuration Prompt for LLM

When implementing an MCP server, ask the following:

1. **"Do you want to configure this for Claude Code?"**
   - If YES: Follow section 6 for Claude Code integration
   - If NO: Server can be used with other MCP clients

2. **"Do you want to test the connection?"**
   - If YES: Run `claude mcp list` and verify "✓ Connected"
   - If connection fails: Follow troubleshooting in section 7

## 10. Complete Working Example

For reference, a minimal working MCP server:

```python
from pydantic import BaseModel, Field
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("ExampleServer")

class ExampleData(BaseModel):
    message: str = Field(description="Example message")
    value: int = Field(description="Example value")

@mcp.tool()
def example_tool(input: str) -> ExampleData:
    """Example tool that returns data."""
    return ExampleData(
        message=f"Processed: {input}",
        value=42
    )

def main():
    mcp.run()

if __name__ == "__main__":
    main()
```

## 🧑‍💻 Getting Help from Senior Engineer

When encountering complex issues or architectural decisions that require senior engineering expertise, you can consult with an intelligent senior engineer using:

```bash
gemini -p "<The prompt>"
```

### Guidelines for Effective Consultation:
- **Provide complete context** in your prompt, including:
  - The specific problem or architectural decision
  - Relevant code snippets or error messages
  - What you've already tried
  - Any constraints or requirements
  - Links to relevant documentation or resources
  
### Example Consultation:
```bash
gemini -p "I'm building an MCP server that needs to handle concurrent database operations. 
Currently experiencing deadlocks when multiple tools access the same resource. 
Error: 'psycopg2.errors.DeadlockDetected: deadlock detected'
Tried implementing retry logic but still facing issues.
Server code: https://github.com/example/repo
MCP spec: https://modelcontextprotocol.io/specification/
What's the best practice for handling concurrent database access in MCP servers?"
```

**Remember:** The prompt must be detailed enough to provide all the context needed for the senior engineer to resolve the issue or answer queries effectively. Include:
- Error messages
- Code context
- Relevant URLs
- What you've attempted
- Specific questions

## Summary

To create any MCP server:
1. Initialize project with `uv init`
2. Add `mcp[cli]` dependency
3. Create FastMCP server with tools/resources
4. Use Pydantic models for structured data
5. Test locally with `uv run main.py`
6. Install in Claude Code with standard pattern:
   ```bash
   cd /path/to/your/server
   claude mcp add --scope user <ServerName> -- bash -c "cd $(pwd) && uv run main.py"
   ```
7. Verify with `claude mcp list`
8. Test in Claude Code CLI

**Key Insight:** Always use the standard installation pattern: `cd /your/server && claude mcp add --scope user <ServerName> -- bash -c "cd $(pwd) && uv run main.py"` to eliminate scope and path issues.

Following these rules will produce a working MCP server integrated with Claude Code, ready for any functionality you need to implement.