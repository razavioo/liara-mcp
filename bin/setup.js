#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { createInterface } from 'readline';
import { homedir, platform } from 'os';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function getNodePath() {
    try {
        return execSync('which node', { encoding: 'utf8' }).trim();
    } catch {
        return null;
    }
}

function getLiaraMcpPath(nodeDir) {
    const nodeModulesDir = join(dirname(nodeDir), 'lib', 'node_modules');
    const liaraMcpPath = join(nodeModulesDir, 'liara-mcp', 'dist', 'index.js');
    
    if (existsSync(liaraMcpPath)) {
        return liaraMcpPath;
    }
    return null;
}

function getCursorConfigPath() {
    const home = homedir();
    return join(home, '.cursor', 'mcp.json');
}

function getClaudeConfigPath() {
    const home = homedir();
    if (platform() === 'darwin') {
        return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    }
    return join(home, '.config', 'Claude', 'claude_desktop_config.json');
}

async function main() {
    console.log('🚀 Liara MCP Setup');
    console.log('==================');
    console.log('');

    // Check Node.js
    const nodePath = getNodePath();
    if (!nodePath) {
        console.log('❌ Node.js is not installed. Please install Node.js first.');
        console.log('   Visit: https://nodejs.org/');
        process.exit(1);
    }
    console.log(`✅ Found Node.js at: ${nodePath}`);

    const nodeDir = dirname(nodePath);
    
    // Check liara-mcp
    let liaraMcpPath = getLiaraMcpPath(nodeDir);
    
    if (!liaraMcpPath) {
        console.log('');
        console.log('📦 Installing liara-mcp globally...');
        try {
            execSync('npm install -g liara-mcp', { stdio: 'inherit' });
            liaraMcpPath = getLiaraMcpPath(nodeDir);
        } catch (error) {
            console.log('❌ Failed to install liara-mcp');
            process.exit(1);
        }
    }

    if (!liaraMcpPath) {
        console.log('❌ liara-mcp not found. Please run: npm install -g liara-mcp');
        process.exit(1);
    }

    console.log(`✅ Found liara-mcp at: ${liaraMcpPath}`);
    console.log('');

    // Get API token
    const apiToken = await question('🔑 Enter your Liara API token (get it from https://console.liara.ir/API): ');
    
    if (!apiToken || apiToken.trim() === '') {
        console.log('❌ API token is required');
        rl.close();
        process.exit(1);
    }

    // Generate config
    const config = {
        mcpServers: {
            liara: {
                command: nodePath,
                args: [liaraMcpPath],
                env: {
                    LIARA_API_TOKEN: apiToken.trim()
                }
            }
        }
    };

    console.log('');
    console.log('📝 Your MCP configuration:');
    console.log('');
    console.log('━'.repeat(60));
    console.log(JSON.stringify(config, null, 2));
    console.log('━'.repeat(60));
    console.log('');

    const cursorConfigPath = getCursorConfigPath();
    const claudeConfigPath = getClaudeConfigPath();

    console.log('📁 Configuration file locations:');
    console.log(`   Cursor: ${cursorConfigPath}`);
    console.log(`   Claude Desktop: ${claudeConfigPath}`);
    console.log('');

    const autoConfig = await question('Would you like to automatically configure Cursor? (y/n): ');

    if (autoConfig.toLowerCase() === 'y') {
        try {
            const configDir = dirname(cursorConfigPath);
            if (!existsSync(configDir)) {
                mkdirSync(configDir, { recursive: true });
            }

            let finalConfig = config;

            // Merge with existing config if present
            if (existsSync(cursorConfigPath)) {
                console.log('⚠️  Existing config found. Creating backup...');
                copyFileSync(cursorConfigPath, `${cursorConfigPath}.backup`);
                
                try {
                    const existing = JSON.parse(readFileSync(cursorConfigPath, 'utf8'));
                    existing.mcpServers = existing.mcpServers || {};
                    existing.mcpServers.liara = config.mcpServers.liara;
                    finalConfig = existing;
                } catch {
                    // Use new config if parsing fails
                }
            }

            writeFileSync(cursorConfigPath, JSON.stringify(finalConfig, null, 2));
            console.log(`✅ Configuration written to ${cursorConfigPath}`);
            console.log('');
            console.log('🎉 Setup complete! Please restart Cursor to apply changes.');
        } catch (error) {
            console.log(`❌ Failed to write config: ${error.message}`);
            console.log('   Please copy the configuration manually.');
        }
    } else {
        console.log('');
        console.log('📋 Copy the configuration above and add it to your MCP client config file.');
    }

    console.log('');
    console.log('📚 Documentation: https://github.com/razavioo/liara-mcp');
    console.log('🆘 Issues: https://github.com/razavioo/liara-mcp/issues');

    rl.close();
}

main().catch(console.error);

