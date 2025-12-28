/**
 * User tool definitions
 */
import { ToolDefinition } from './types.js';

export function getUserTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_get_user',
            description: 'Get comprehensive user information including plans and teams',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
    ];
}
