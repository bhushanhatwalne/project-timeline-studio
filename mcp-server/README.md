# Timeline Studio MCP Server

A Model Context Protocol (MCP) server for the Timeline Studio application. This enables programmatic access to your timeline data and app structure.

## Installation

```bash
cd mcp-server
npm install
```

## Starting the Server

```bash
npm start
```

The server is also auto-started by Claude Code via the configuration in `.claude/settings.json`.

## Available Tools

### `read_html`
Read the entire Timeline Studio HTML file. Shows file size and first 2000 characters.

### `extract_javascript`
Extract and display the JavaScript code section from the HTML file.

### `extract_css`
Extract and display the CSS code section from the HTML file.

### `list_functions`
List all JavaScript functions defined in the app:
- Displays all declared functions, constants, and variables
- Useful for finding function signatures quickly

### `analyze_data_structure`
Show the timeline data structure schema:
```javascript
swimlane: { id, name, phase, children[] }
row: { id, title, type, start, end, percent, assignedTo, status, visible, note }
version: { id, name, group, savedAt, data: { swimlanes, projectTitle } }
```

### `create_sample_timeline`
Generate sample timeline data for testing purposes.

**Parameters:**
- `swimlanes` (number): Number of swimlanes to create (default: 3)
- `tasksPerSwimLane` (number): Tasks per swimlane (default: 4)

**Example response:**
```json
{
  "swimlanes": [
    {
      "id": "phase-0",
      "name": "Phase 1",
      "phase": "phase-0",
      "children": [
        {
          "id": "task-0-0",
          "title": "Task 1",
          "type": "task",
          "start": "2026-09-01",
          "end": "2026-09-09",
          "percent": 45,
          "assignedTo": "Team 1",
          "status": "in-progress",
          "visible": true,
          "note": ""
        }
      ]
    }
  ],
  "projectTitle": "Sample Project"
}
```

### `get_storage_data`
Read test data from a JSON file in the `storage/` directory.

**Parameters:**
- `key` (string): Storage key name (e.g., `tlStudio.versions.v1`)

### `save_storage_data`
Save test data to a JSON file for inspection or debugging.

**Parameters:**
- `key` (string): Storage key name
- `data` (object): Data to save

**Example:**
```json
{
  "key": "test-timeline",
  "data": {
    "swimlanes": [...],
    "projectTitle": "Test Project"
  }
}
```

## Use Cases

- **Development**: Extract CSS/JavaScript to understand code structure
- **Testing**: Generate sample data and inspect stored timelines
- **Debugging**: Analyze localStorage data format and timeline structure
- **Documentation**: List all functions and understand data schemas
- **API Design**: Reference the data structure when building a backend

## Storage Directory

Test data is saved to `mcp-server/storage/` as JSON files. These are useful for:
- Inspecting serialized timeline data
- Creating fixtures for backend API tests
- Debugging storage format issues
- Version control of test datasets

## Architecture

The MCP server is a Node.js process that:
1. Reads your HTML file on demand
2. Parses JavaScript and CSS sections
3. Manages test data in the `storage/` directory
4. Provides tools for code analysis and data structure inspection

All operations are read-only to your main HTML file. Test data is isolated in `storage/`.

## Integration with Claude Code

Once configured in `.claude/settings.json`, the server is available to Claude for:
- Analyzing your code structure
- Generating test data
- Inspecting timeline data formats
- Understanding function signatures

To use it in Claude Code:
```
I can use the timeline-studio MCP server to read your app structure, extract code sections, 
analyze data formats, and generate sample timelines for testing.
```
