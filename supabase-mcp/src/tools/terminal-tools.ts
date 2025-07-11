/**
 * Terminal Access Tools for MCP Server
 * Provides terminal command execution, file system access, and development assistance
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

// Security configurations
const ALLOWED_COMMANDS = [
  'ls', 'cat', 'pwd', 'git', 'npm', 'node', 'npx', 'which', 'whoami',
  'cd', 'mkdir', 'touch', 'echo', 'grep', 'find', 'head', 'tail',
  'ps', 'top', 'df', 'du', 'free', 'uname', 'date', 'curl', 'wget'
];

const BLOCKED_COMMANDS = [
  'rm', 'rmdir', 'del', 'format', 'sudo', 'su', 'passwd', 'chmod',
  'chown', 'kill', 'killall', 'shutdown', 'reboot', 'halt', 'init'
];

const SAFE_DIRECTORIES = [
  '/Users/matthewfitzpatrick/pinnlo-v2',
  '/tmp',
  '/var/tmp'
];

export const terminalTools = [
  {
    name: 'execute_command',
    description: 'Execute a shell command in the terminal with safety restrictions',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to execute',
        },
        cwd: {
          type: 'string',
          description: 'Working directory (optional, defaults to project root)',
        },
        timeout: {
          type: 'number',
          description: 'Command timeout in milliseconds (default: 30000)',
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'read_file_content',
    description: 'Read the contents of a file with path validation',
    inputSchema: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          description: 'Path to the file to read',
        },
        encoding: {
          type: 'string',
          description: 'File encoding (default: utf-8)',
        },
        maxSize: {
          type: 'number',
          description: 'Maximum file size to read in bytes (default: 1MB)',
        },
      },
      required: ['filepath'],
    },
  },
  {
    name: 'list_directory_contents',
    description: 'List contents of a directory with detailed information',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Directory path to list',
        },
        detailed: {
          type: 'boolean',
          description: 'Include detailed file information (size, dates, permissions)',
        },
        recursive: {
          type: 'boolean',
          description: 'List subdirectories recursively (max depth: 3)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'get_project_status',
    description: 'Get comprehensive project status including git, npm, and build info',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Project path (defaults to current directory)',
        },
      },
    },
  },
  {
    name: 'monitor_file_changes',
    description: 'Monitor file changes in specified directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to monitor',
        },
        pattern: {
          type: 'string',
          description: 'File pattern to match (glob pattern)',
        },
        duration: {
          type: 'number',
          description: 'Monitoring duration in seconds (default: 60)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'get_system_info',
    description: 'Get system information for debugging and environment context',
    inputSchema: {
      type: 'object',
      properties: {
        detailed: {
          type: 'boolean',
          description: 'Include detailed system information',
        },
      },
    },
  },
];

// Utility functions
function isCommandAllowed(command: string): { allowed: boolean; reason?: string } {
  const commandBase = command.trim().split(' ')[0].toLowerCase();
  
  if (BLOCKED_COMMANDS.includes(commandBase)) {
    return { allowed: false, reason: `Command '${commandBase}' is blocked for security` };
  }
  
  if (!ALLOWED_COMMANDS.includes(commandBase)) {
    return { allowed: false, reason: `Command '${commandBase}' is not in allowed list` };
  }
  
  return { allowed: true };
}

function isPathSafe(filePath: string): boolean {
  const resolvedPath = path.resolve(filePath);
  return SAFE_DIRECTORIES.some(safeDir => resolvedPath.startsWith(path.resolve(safeDir)));
}

// Tool handlers
export async function handleExecuteCommand(args: any) {
  try {
    const { 
      command, 
      cwd = '/Users/matthewfitzpatrick/pinnlo-v2', 
      timeout = 30000 
    } = args;

    // Security check
    const commandCheck = isCommandAllowed(command);
    if (!commandCheck.allowed) {
      throw new Error(commandCheck.reason);
    }

    // Path safety check
    if (cwd && !isPathSafe(cwd)) {
      throw new Error(`Working directory '${cwd}' is not allowed`);
    }

    const options = { 
      cwd: cwd || '/Users/matthewfitzpatrick/pinnlo-v2',
      timeout: Math.min(timeout, 60000), // Max 60 seconds
      maxBuffer: 1024 * 1024 // 1MB buffer
    };

    // Debug: Executing command (removed console.log to prevent JSON parsing issues)
    const { stdout, stderr } = await execAsync(command, options);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            command,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            cwd: options.cwd,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error',
            command: args.command,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

export async function handleReadFileContent(args: any) {
  try {
    const { 
      filepath, 
      encoding = 'utf-8', 
      maxSize = 1024 * 1024 // 1MB default
    } = args;

    // Path safety check
    if (!isPathSafe(filepath)) {
      throw new Error(`File path '${filepath}' is not allowed`);
    }

    // Check file size first
    const stats = await fs.stat(filepath);
    if (stats.size > maxSize) {
      throw new Error(`File too large: ${stats.size} bytes (max: ${maxSize})`);
    }

    const content = await fs.readFile(filepath, encoding);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            filepath,
            content,
            size: content.length,
            encoding,
            lastModified: stats.mtime.toISOString(),
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error',
            filepath: args.filepath,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

export async function handleListDirectoryContents(args: any) {
  try {
    const { path: dirPath, detailed = false, recursive = false } = args;

    // Path safety check
    if (!isPathSafe(dirPath)) {
      throw new Error(`Directory path '${dirPath}' is not allowed`);
    }

    async function listDir(currentPath: string, depth = 0): Promise<any[]> {
      if (recursive && depth > 3) return []; // Max depth limit

      const items = await fs.readdir(currentPath, { withFileTypes: true });
      const result = [];

      for (const item of items) {
        const itemPath = path.join(currentPath, item.name);
        const itemInfo: any = {
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          path: itemPath,
        };

        if (detailed) {
          try {
            const stats = await fs.stat(itemPath);
            itemInfo.size = stats.size;
            itemInfo.lastModified = stats.mtime.toISOString();
            itemInfo.permissions = (stats.mode & parseInt('777', 8)).toString(8);
          } catch (error) {
            itemInfo.error = 'Unable to get stats';
          }
        }

        if (recursive && item.isDirectory() && depth < 3) {
          try {
            itemInfo.children = await listDir(itemPath, depth + 1);
          } catch (error) {
            itemInfo.children = [];
            itemInfo.error = 'Unable to read subdirectory';
          }
        }

        result.push(itemInfo);
      }

      return result.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    }

    const items = await listDir(dirPath);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            path: dirPath,
            items,
            count: items.length,
            detailed,
            recursive,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error',
            path: args.path,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

export async function handleGetProjectStatus(args: any) {
  try {
    const { projectPath = '/Users/matthewfitzpatrick/pinnlo-v2' } = args;

    // Path safety check
    if (!isPathSafe(projectPath)) {
      throw new Error(`Project path '${projectPath}' is not allowed`);
    }

    const status: any = {
      projectPath,
      timestamp: new Date().toISOString(),
    };

    // Git status
    try {
      const { stdout: gitStatus } = await execAsync('git status --porcelain', { cwd: projectPath });
      const { stdout: gitBranch } = await execAsync('git branch --show-current', { cwd: projectPath });
      const { stdout: gitCommit } = await execAsync('git rev-parse HEAD', { cwd: projectPath });
      
      status.git = {
        branch: gitBranch.trim(),
        commit: gitCommit.trim().substring(0, 8),
        hasChanges: gitStatus.trim().length > 0,
        changedFiles: gitStatus.trim().split('\n').filter(line => line.trim()).length,
      };
    } catch (error) {
      status.git = { error: 'Not a git repository or git not available' };
    }

    // Package.json info
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      status.npm = {
        name: packageJson.name,
        version: packageJson.version,
        scripts: Object.keys(packageJson.scripts || {}),
        dependencies: Object.keys(packageJson.dependencies || {}).length,
        devDependencies: Object.keys(packageJson.devDependencies || {}).length,
      };
    } catch (error) {
      status.npm = { error: 'No package.json found' };
    }

    // Build status
    try {
      const { stdout: buildCheck } = await execAsync('npm run build --dry-run', { cwd: projectPath });
      status.build = { available: true };
    } catch (error) {
      status.build = { available: false, error: 'Build script not available' };
    }

    // Directory size
    try {
      const { stdout: sizeOutput } = await execAsync(`du -sh "${projectPath}"`, { cwd: projectPath });
      status.size = sizeOutput.trim().split('\t')[0];
    } catch (error) {
      status.size = 'Unable to determine';
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

export async function handleGetSystemInfo(args: any) {
  try {
    const { detailed = false } = args;

    const systemInfo: any = {
      timestamp: new Date().toISOString(),
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    if (detailed) {
      try {
        const { stdout: osInfo } = await execAsync('uname -a');
        systemInfo.os = osInfo.trim();
      } catch (error) {
        systemInfo.os = 'Unable to determine';
      }

      try {
        const { stdout: memInfo } = await execAsync('free -h 2>/dev/null || vm_stat');
        systemInfo.memory = memInfo.trim();
      } catch (error) {
        systemInfo.memory = 'Unable to determine';
      }

      try {
        const { stdout: diskInfo } = await execAsync('df -h');
        systemInfo.disk = diskInfo.trim();
      } catch (error) {
        systemInfo.disk = 'Unable to determine';
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(systemInfo, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

export async function handleMonitorFileChanges(args: any) {
  try {
    const { path: watchPath, pattern = '*', duration = 60 } = args;

    // Path safety check
    if (!isPathSafe(watchPath)) {
      throw new Error(`Watch path '${watchPath}' is not allowed`);
    }

    // This is a simplified implementation
    // In a real scenario, you'd use fs.watch or chokidar for proper file watching
    const stats = await fs.stat(watchPath);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'File monitoring started (simplified implementation)',
            path: watchPath,
            pattern,
            duration,
            isDirectory: stats.isDirectory(),
            timestamp: new Date().toISOString(),
            note: 'This is a basic implementation. For real-time monitoring, consider using chokidar or fs.watch',
          }, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error',
            path: args.path,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
