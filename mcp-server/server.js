import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { mcpAuthRouter, getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';
import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import { createOAuthProvider } from './oauthProvider.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const localHtmlPath = path.join(projectRoot, 'project-timeline-studio.html');
const storageDir = path.join(projectRoot, 'storage');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Load env vars for local dev (Render injects these directly in production)
require('dotenv').config({ path: path.join(projectRoot, 'server', '.env') });

// Read local HTML directly from disk for MCP tools
function getHtmlContent() {
  if (fs.existsSync(localHtmlPath)) {
    return fs.readFileSync(localHtmlPath, 'utf-8');
  }
  throw new Error('project-timeline-studio.html file not found in project root.');
}

// ===== Backend: auth + projects + versions (CommonJS, shared with server/) =====
const runMigrations = require('../server/src/runMigrations.js');
const authRoutes = require('../server/src/routes/auth.routes.js');
const projectRoutes = require('../server/src/routes/projects.routes.js');
const versionRoutes = require('../server/src/routes/versions.routes.js');
const { listOpenProjects } = require('./projectTools.cjs');

// Render sets RENDER_EXTERNAL_URL to the service's public HTTPS URL. Fall back
// to localhost for local dev (the SDK allows http:// only for localhost).
const PUBLIC_URL = process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3001}`;
const issuerUrl = new URL(PUBLIC_URL);

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects/:projectId/versions', versionRoutes);

// ===== MCP OAuth: gates /sse and /message behind a Timeline Studio login =====
const oauthProvider = createOAuthProvider();
app.use(mcpAuthRouter({ provider: oauthProvider, issuerUrl, scopesSupported: [] }));
const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(issuerUrl);
const requireMcpAuth = requireBearerAuth({ verifier: oauthProvider, resourceMetadataUrl });

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static assets from project root
app.use(express.static(projectRoot));

// Serve restored app UI directly at root URL
app.get('/', (req, res) => {
  if (fs.existsSync(localHtmlPath)) {
    res.sendFile(localHtmlPath);
  } else {
    res.status(404).send('project-timeline-studio.html not found');
  }
});

// Tools Definition
const tools = [
  {
    name: 'list_open_projects',
    description: "List the signed-in user's open (not fully complete) projects, each with a derived overall status and its current ongoing task.",
    inputSchema: { type: 'object', properties: {} },
  },
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
    description: 'Read localStorage data from a JSON file',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Storage key to read' },
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

// Each SSE connection gets its own Server instance — the SDK's Server.connect()
// throws "Already connected to a transport" if reused across connections.
function createMcpServer() {
  const server = new Server({
    name: 'timeline-studio-mcp',
    version: '1.0.0',
  }, {
    capabilities: {
      tools: {},
    },
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args = {} } = request.params;

  try {
    if (name === 'list_open_projects') {
      const userId = extra?.authInfo?.extra?.userId;
      if (!userId) throw new Error('Missing authenticated user context');
      const projects = await listOpenProjects(userId);
      return { content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }] };
    }

    if (name === 'read_html') {
      const content = getHtmlContent();
      return { content: [{ type: 'text', text: `HTML file size: ${content.length} bytes\n\nFirst 2000 chars:\n\n${content.substring(0, 2000)}...` }] };
    }

    if (name === 'extract_javascript') {
      const content = getHtmlContent();
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      if (!scriptMatch) return { content: [{ type: 'text', text: 'No script tag found' }] };
      return { content: [{ type: 'text', text: scriptMatch[1].substring(0, 5000) + '\n...[truncated]' }] };
    }

    if (name === 'extract_css') {
      const content = getHtmlContent();
      const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      if (!styleMatch) return { content: [{ type: 'text', text: 'No style tag found' }] };
      return { content: [{ type: 'text', text: styleMatch[1].substring(0, 5000) + '\n...[truncated]' }] };
    }

    if (name === 'list_functions') {
      const content = getHtmlContent();
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

      return { content: [{ type: 'text', text: JSON.stringify({ swimlanes, projectTitle: 'Sample Project' }, null, 2) }] };
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
  }
  });

  return server;
}

// MCP SSE Endpoints — one Server + transport per connected client, keyed by sessionId
const sessions = new Map();

app.get('/sse', requireMcpAuth, async (req, res) => {
  const transport = new SSEServerTransport('/message', res);
  const server = createMcpServer();
  sessions.set(transport.sessionId, transport);
  res.on('close', () => {
    sessions.delete(transport.sessionId);
  });
  await server.connect(transport);
});

app.post('/message', requireMcpAuth, async (req, res) => {
  const transport = sessions.get(req.query.sessionId);
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('SSE session not initialized');
  }
});

// Catch-all for SPA-style navigation (must be last)
app.get('/*splat', (req, res) => {
  if (fs.existsSync(localHtmlPath)) {
    res.sendFile(localHtmlPath);
  } else {
    res.status(404).send('project-timeline-studio.html not found');
  }
});

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    console.log('[MIGRATIONS] Running database migrations...');
    await runMigrations();
    console.log('[MIGRATIONS] ✓ Completed');
  } catch (err) {
    console.error('[MIGRATIONS] ✗ Failed (continuing to start server):', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Timeline Studio App & MCP Server running on port ${PORT}`);
    console.log(`MCP OAuth issuer: ${issuerUrl.href}`);
  });
})();
