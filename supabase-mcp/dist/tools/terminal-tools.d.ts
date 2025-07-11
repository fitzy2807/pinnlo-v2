/**
 * Terminal Access Tools for MCP Server
 * Provides terminal command execution, file system access, and development assistance
 */
export declare const terminalTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            command: {
                type: string;
                description: string;
            };
            cwd: {
                type: string;
                description: string;
            };
            timeout: {
                type: string;
                description: string;
            };
            filepath?: undefined;
            encoding?: undefined;
            maxSize?: undefined;
            path?: undefined;
            detailed?: undefined;
            recursive?: undefined;
            projectPath?: undefined;
            pattern?: undefined;
            duration?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            filepath: {
                type: string;
                description: string;
            };
            encoding: {
                type: string;
                description: string;
            };
            maxSize: {
                type: string;
                description: string;
            };
            command?: undefined;
            cwd?: undefined;
            timeout?: undefined;
            path?: undefined;
            detailed?: undefined;
            recursive?: undefined;
            projectPath?: undefined;
            pattern?: undefined;
            duration?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            path: {
                type: string;
                description: string;
            };
            detailed: {
                type: string;
                description: string;
            };
            recursive: {
                type: string;
                description: string;
            };
            command?: undefined;
            cwd?: undefined;
            timeout?: undefined;
            filepath?: undefined;
            encoding?: undefined;
            maxSize?: undefined;
            projectPath?: undefined;
            pattern?: undefined;
            duration?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            projectPath: {
                type: string;
                description: string;
            };
            command?: undefined;
            cwd?: undefined;
            timeout?: undefined;
            filepath?: undefined;
            encoding?: undefined;
            maxSize?: undefined;
            path?: undefined;
            detailed?: undefined;
            recursive?: undefined;
            pattern?: undefined;
            duration?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            path: {
                type: string;
                description: string;
            };
            pattern: {
                type: string;
                description: string;
            };
            duration: {
                type: string;
                description: string;
            };
            command?: undefined;
            cwd?: undefined;
            timeout?: undefined;
            filepath?: undefined;
            encoding?: undefined;
            maxSize?: undefined;
            detailed?: undefined;
            recursive?: undefined;
            projectPath?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            detailed: {
                type: string;
                description: string;
            };
            command?: undefined;
            cwd?: undefined;
            timeout?: undefined;
            filepath?: undefined;
            encoding?: undefined;
            maxSize?: undefined;
            path?: undefined;
            recursive?: undefined;
            projectPath?: undefined;
            pattern?: undefined;
            duration?: undefined;
        };
        required?: undefined;
    };
})[];
export declare function handleExecuteCommand(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare function handleReadFileContent(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare function handleListDirectoryContents(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare function handleGetProjectStatus(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare function handleGetSystemInfo(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare function handleMonitorFileChanges(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
//# sourceMappingURL=terminal-tools.d.ts.map