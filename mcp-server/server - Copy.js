import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(projectRoot, 'project-timeline-studio.html');
const storageDir = path.join(projectRoot, 'storage');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const server = new Server({
  name: 'timeline-studio-mcp',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Tools definition
const tools = [
  {
    name: 'read_html',
    description: 'Read the current Timeline Studio HTML file',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'extract_javascript',
    description: 'Extract JavaScript code from the HTML file',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'extract_css',
    description: 'Extract CSS code from the HTML file',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_functions',
    description: 'List all JavaScript functions in the app',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_storage_data',
    description: 'Read localStorage data from a JSON file (for testing)',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Storage key to read (e.g., tlStudio.versions.v1)' },
      },
      required: ['key'],
    },
  },
  {
    name: 'save_storage_data',
    description: 'Save test data to a JSON file',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Storage key name' },
        data: { type: 'object', description: 'Data to save' },
      },
      required: ['key', 'data'],
    },
  },
  {
    name: 'analyze_data_structure',
    description: 'Analyze and show the timeline data structure',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'create_sample_timeline',
    description: 'Generate sample timeline data for testing',
    inputSchema: {
      type: 'object',
      properties: {
        swimlanes: { type: 'number', description: 'Number of swimlanes (default: 3)' },
        tasksPerSwimLane: { type: 'number', description: 'Tasks per swimlane (default: 4)' },
      },
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    if (name === 'read_html') {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      return { content: [{ type: 'text', text: `HTML file size: ${content.length} bytes\n\nFirst 2000 chars:\n\n${content.substring(0, 2000)}...` }] };
    }

    if (name === 'extract_javascript') {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      if (!scriptMatch) return { content: [{ type: 'text', text: 'No script tag found' }] };
      return { content: [{ type: 'text', text: scriptMatch[1].substring(0, 5000) + '\n...[truncated]' }] };
    }

    if (name === 'extract_css') {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      if (!styleMatch) return { content: [{ type: 'text', text: 'No style tag found' }] };
      return { content: [{ type: 'text', text: styleMatch[1].substring(0, 5000) + '\n...[truncated]' }] };
    }

    if (name === 'list_functions') {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      if (!scriptMatch) return { content: [{ type: 'text', text: 'No script tag found' }] };

      const js = scriptMatch[1];
      const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*(?:=\s*)?(?:function|\()/g;
      const functions = [];
      let match;
      while ((match = functionRegex.exec(js)) !== null) {
        functions.push(match[1]);
      }

      const unique = [...new Set(functions)];
      return { content: [{ type: 'text', text: `Found ${unique.length} functions:\n\n${unique.join('\n')}` }] };
    }

    if (name === 'get_storage_data') {
      const file = path.join(storageDir, `${args.key}.json`);
      if (!fs.existsSync(file)) {
        return { content: [{ type: 'text', text: `No data found for key: ${args.key}` }] };
      }
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }

    if (name === 'save_storage_data') {
      const file = path.join(storageDir, `${args.key}.json`);
      fs.writeFileSync(file, JSON.stringify(args.data, null, 2));
      return { content: [{ type: 'text', text: `Saved data to ${file}` }] };
    }

    if (name === 'analyze_data_structure') {
      const structure = {
        swimlane: { id: 'string', name: 'string', phase: 'string', children: ['row'] },
        row: {
          id: 'string',
          title: 'string',
          type: 'enum(task|milestone|phase)',
          start: 'YYYY-MM-DD',
          end: 'YYYY-MM-DD',
          percent: '0-100',
          assignedTo: 'string',
          status: 'enum(not-started|in-progress|complete|behind-schedule|at-risk)',
          visible: 'boolean',
          note: 'string',
        },
        version: {
          id: 'string',
          name: 'string',
          group: 'string',
          savedAt: 'ISO timestamp',
          data: { swimlanes: ['swimlane'], projectTitle: 'string' },
        },
      };
      return { content: [{ type: 'text', text: JSON.stringify(structure, null, 2) }] };
    }

    if (name === 'create_sample_timeline') {
      const swimlaneCount = args.swimlanes || 3;
      const taskCount = args.tasksPerSwimLane || 4;

      const swimlanes = [];
      for (let i = 0; i < swimlaneCount; i++) {
        const children = [];
        for (let j = 0; j < taskCount; j++) {
          const start = new Date(2026, 8, 1 + j * 10);
          const end = new Date(start.getTime() + 8 * 24 * 60 * 60 * 1000);
          children.push({
            id: `task-${i}-${j}`,
            title: `Task ${j + 1}`,
            type: j === taskCount - 1 ? 'milestone' : 'task',
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            percent: Math.floor(Math.random() * 100),
            assignedTo: `Team ${i + 1}`,
            status: ['not-started', 'in-progress', 'complete'][Math.floor(Math.random() * 3)],
            visible: true,
            note: '',
          });
        }
        swimlanes.push({
          id: `phase-${i}`,
          name: `Phase ${i + 1}`,
          phase: `phase-${i}`,
          children,
        });
      }

      const timeline = {
        swimlanes,
        projectTitle: 'Sample Project',
        version: 1,
      };

      return { content: [{ type: 'text', text: JSON.stringify(timeline, null, 2) }] };
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
