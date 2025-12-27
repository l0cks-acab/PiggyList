import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Import rcon package for RCON connections
const require = createRequire(import.meta.url);
const Rcon = require('rcon');

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Load config
let config = {};
const configPath = path.join(__dirname, 'config.json');
const linkedAccountsPath = path.join(__dirname, 'data', 'linkedAccounts.json');

function loadConfig() {
    try {
        const data = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(data);
    } catch (error) {
        console.error('Error loading config:', error);
        config = {
            minecraft: { host: '', port: 25575, password: '' },
            discord: { linkedRoleId: '', adminRoleId: '' }
        };
    }
}

function saveConfig() {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error saving config:', error);
    }
}

function loadLinkedAccounts() {
    try {
        const data = fs.readFileSync(linkedAccountsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

function saveLinkedAccounts(accounts) {
    try {
        // Ensure data directory exists
        const dataDir = path.dirname(linkedAccountsPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(linkedAccountsPath, JSON.stringify(accounts, null, 2));
    } catch (error) {
        console.error('Error saving linked accounts:', error);
    }
}

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// RCON connection helper
async function executeRconCommand(command) {
    if (!config.minecraft.host || !config.minecraft.password) {
        throw new Error('Minecraft server not configured. Please use /config-server to set it up.');
    }

    const host = config.minecraft.host;
    const port = config.minecraft.port || 25575;
    const password = config.minecraft.password;

    try {
        const client = new Rcon(host, port, password);
        
        return new Promise((resolve, reject) => {
            let resolved = false;
            
            const cleanup = () => {
                if (!resolved) {
                    resolved = true;
                    try {
                        client.disconnect();
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                }
            };
            
            client.on('auth', () => {
                // Authenticated, now send command
                client.send(command);
            });
            
            client.on('response', (response) => {
                cleanup();
                resolve(response);
            });
            
            client.on('error', (err) => {
                cleanup();
                reject(err);
            });
            
            client.on('end', () => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error('RCON connection ended unexpectedly'));
                }
            });
            
            client.connect();
        });
    } catch (error) {
        console.error('RCON error:', error);
        throw error;
    }
}

// Slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Minecraft account to your Discord account')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Your Minecraft username')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('config-server')
        .setDescription('Configure the Minecraft server connection (Admin only)')
        .addStringOption(option =>
            option.setName('host')
                .setDescription('Minecraft server IP address')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('password')
                .setDescription('RCON password')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('port')
                .setDescription('RCON port (default: 25575)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('config-role')
        .setDescription('Configure the role assigned when users link their account (Admin only)')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to assign when users link their account')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('config-admin-role')
        .setDescription('Set the admin role for bot commands (Admin only)')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Admin role for bot commands')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlink your Minecraft account from your Discord account'),
    
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check your linked account status'),
    
    new SlashCommandBuilder()
        .setName('linkdb')
        .setDescription('Display all linked accounts (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('check')
        .setDescription('Check a user\'s linked Minecraft account (Admin only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map(command => command.toJSON());

// Register slash commands
async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const clientId = process.env.DISCORD_CLIENT_ID || client.user?.id;

    if (!clientId) {
        console.error('❌ DISCORD_CLIENT_ID is not set and could not be determined from client.');
        return;
    }

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully registered application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// Check if user has admin permissions
function hasAdminPermission(member) {
    if (!member) return false;
    
    // Check if user has administrator permission
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        return true;
    }
    
    // Check if user has the configured admin role
    if (config.discord.adminRoleId) {
        return member.roles.cache.has(config.discord.adminRoleId);
    }
    
    return false;
}

// When the client is ready, run this code
client.once('clientReady', async () => {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`📊 Bot is in ${client.guilds.cache.size} guild(s)`);
    
    loadConfig();
    await registerCommands();
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'link') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const username = interaction.options.getString('username');
        const userId = interaction.user.id;
        const member = interaction.member;

        // Validate Minecraft username (basic validation)
        if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
            await interaction.editReply('❌ Invalid Minecraft username. Username must be 3-16 characters and contain only letters, numbers, and underscores.');
            return;
        }

        // Load linked accounts
        const linkedAccounts = loadLinkedAccounts();

        // Check if Discord account is already linked
        if (linkedAccounts[userId]) {
            await interaction.editReply(`❌ Your Discord account is already linked to Minecraft account: **${linkedAccounts[userId].minecraftUsername}**\nUse /unlink to unlink your account first.`);
            return;
        }

        // Check if Minecraft account is already linked to another Discord account
        const existingLink = Object.entries(linkedAccounts).find(
            ([_, data]) => data.minecraftUsername.toLowerCase() === username.toLowerCase()
        );

        if (existingLink) {
            await interaction.editReply('❌ This Minecraft account is already linked to another Discord account.');
            return;
        }

        try {
            // Execute whitelist command via RCON
            await executeRconCommand(`whitelist add ${username}`);
            
            // Console confirmation
            console.log(`✅ Player whitelisted: ${username} (Discord: ${interaction.user.tag} - ${interaction.user.id})`);
            
            // Save linked account
            linkedAccounts[userId] = {
                minecraftUsername: username,
                linkedAt: new Date().toISOString(),
            };
            saveLinkedAccounts(linkedAccounts);

            // Assign role if configured
            if (config.discord.linkedRoleId && member) {
                const role = interaction.guild.roles.cache.get(config.discord.linkedRoleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`✅ Assigned role ${role.name} to ${interaction.user.tag}`);
                }
            }

            await interaction.editReply(`✅ Successfully linked your Minecraft account **${username}**!\nYou have been whitelisted on the server and granted access.`);
        } catch (error) {
            console.error('Error linking account:', error);
            await interaction.editReply(`❌ Failed to link account: ${error.message}\nPlease make sure the server is configured correctly and RCON is enabled.`);
        }
    }

    if (commandName === 'unlink') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userId = interaction.user.id;
        const member = interaction.member;
        const linkedAccounts = loadLinkedAccounts();

        if (!linkedAccounts[userId]) {
            await interaction.editReply('❌ Your Discord account is not linked to any Minecraft account.');
            return;
        }

        const minecraftUsername = linkedAccounts[userId].minecraftUsername;

        try {
            // Remove from whitelist via RCON
            await executeRconCommand(`whitelist remove ${minecraftUsername}`);
            
            // Console confirmation
            console.log(`❌ Player removed from whitelist: ${minecraftUsername} (Discord: ${interaction.user.tag} - ${interaction.user.id})`);
            
            // Remove role if configured
            if (config.discord.linkedRoleId && member) {
                const role = interaction.guild.roles.cache.get(config.discord.linkedRoleId);
                if (role && member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                }
            }

            // Remove from linked accounts
            delete linkedAccounts[userId];
            saveLinkedAccounts(linkedAccounts);

            await interaction.editReply(`✅ Successfully unlinked your Minecraft account **${minecraftUsername}**.\nYou have been removed from the whitelist.`);
        } catch (error) {
            console.error('Error unlinking account:', error);
            await interaction.editReply(`❌ Failed to unlink account: ${error.message}`);
        }
    }

    if (commandName === 'status') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userId = interaction.user.id;
        const linkedAccounts = loadLinkedAccounts();

        if (!linkedAccounts[userId]) {
            await interaction.editReply('❌ Your Discord account is not linked to any Minecraft account.\nUse /link to link your account.');
            return;
        }

        const account = linkedAccounts[userId];
        await interaction.editReply(`✅ **Linked Account Status**\nMinecraft Username: **${account.minecraftUsername}**\nLinked At: ${new Date(account.linkedAt).toLocaleString()}`);
    }

    if (commandName === 'config-server') {
        if (!hasAdminPermission(interaction.member)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const host = interaction.options.getString('host');
        const port = interaction.options.getInteger('port') || 25575;
        const password = interaction.options.getString('password');

        config.minecraft.host = host;
        config.minecraft.port = port;
        config.minecraft.password = password;
        saveConfig();

        // Test connection
        try {
            await executeRconCommand('list');
            await interaction.editReply(`✅ Minecraft server configured successfully!\nHost: ${host}\nPort: ${port}\nConnection test: ✅ Success`);
        } catch (error) {
            await interaction.editReply(`⚠️ Server configuration saved, but connection test failed:\n${error.message}\nPlease verify your RCON settings.`);
        }
    }

    if (commandName === 'config-role') {
        if (!hasAdminPermission(interaction.member)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
            return;
        }

        const role = interaction.options.getRole('role');
        config.discord.linkedRoleId = role.id;
        saveConfig();

        await interaction.reply({ content: `✅ Linked role set to: ${role.name}`, flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'config-admin-role') {
        if (!hasAdminPermission(interaction.member)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
            return;
        }

        const role = interaction.options.getRole('role');
        config.discord.adminRoleId = role.id;
        saveConfig();

        await interaction.reply({ content: `✅ Admin role set to: ${role.name}`, flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'linkdb') {
        if (!hasAdminPermission(interaction.member)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const linkedAccounts = loadLinkedAccounts();
        const totalLinked = Object.keys(linkedAccounts).length;

        if (totalLinked === 0) {
            await interaction.editReply('📋 **Linked Accounts Database**\n\nNo accounts are currently linked.');
            return;
        }

        // Fetch user information for each linked account
        const entries = [];
        for (const [userId, accountData] of Object.entries(linkedAccounts)) {
            try {
                const user = await client.users.fetch(userId);
                const linkedDate = new Date(accountData.linkedAt).toLocaleString();
                entries.push({
                    discordTag: user.tag,
                    discordId: userId,
                    minecraftUsername: accountData.minecraftUsername,
                    linkedAt: linkedDate
                });
            } catch (error) {
                // User might have left the server or account was deleted
                entries.push({
                    discordTag: 'Unknown User',
                    discordId: userId,
                    minecraftUsername: accountData.minecraftUsername,
                    linkedAt: new Date(accountData.linkedAt).toLocaleString()
                });
            }
        }

        // Format the response (Discord has a 2000 character limit)
        let response = `📋 **Linked Accounts Database**\n\n**Total Linked:** ${totalLinked}\n\n`;
        
        entries.forEach((entry, index) => {
            const entryText = `${index + 1}. **${entry.minecraftUsername}**\n   Discord: ${entry.discordTag} (${entry.discordId})\n   Linked: ${entry.linkedAt}\n\n`;
            
            // If adding this entry would exceed the limit, send what we have and start a new message
            if (response.length + entryText.length > 1900) {
                // We'll handle pagination if needed, but for now just truncate
                response += '... (too many entries to display in one message)';
                return;
            }
            response += entryText;
        });

        await interaction.editReply(response);
    }

    if (commandName === 'check') {
        if (!hasAdminPermission(interaction.member)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const targetUser = interaction.options.getUser('user');
        const linkedAccounts = loadLinkedAccounts();
        const accountData = linkedAccounts[targetUser.id];

        if (!accountData) {
            await interaction.editReply(`❌ **Account Check**\n\n**User:** ${targetUser.tag} (${targetUser.id})\n**Status:** Not linked to any Minecraft account.`);
            return;
        }

        const linkedDate = new Date(accountData.linkedAt).toLocaleString();
        await interaction.editReply(`✅ **Account Check**\n\n**User:** ${targetUser.tag} (${targetUser.id})\n**Minecraft Username:** ${accountData.minecraftUsername}\n**Linked At:** ${linkedDate}`);
    }
});

// Error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord with your client's token
const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('❌ DISCORD_TOKEN is not set in .env file!');
    process.exit(1);
}

client.login(token);
