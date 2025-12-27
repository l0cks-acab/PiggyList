# PiggyList Discord Bot

> **Seamlessly connect your Discord community with your Minecraft server**

PiggyList is the ultimate Discord bot that bridges the gap between your Discord server and Minecraft community. Say goodbye to manual whitelisting and hello to automated account linking, instant whitelisting, and seamless role management—all with a single command.

###  Key Benefits

-  **Instant Whitelisting** - Players are automatically whitelisted the moment they link their account
-  **One-Click Linking** - Simple `/link` command connects Discord and Minecraft accounts forever
-  **Automatic Role Assignment** - Grant access and recognition instantly with custom roles
-  **Secure & Reliable** - Built with modern Node.js and battle-tested RCON integration
-  **Complete Admin Control** - Full database access and user management tools
-  **Zero Manual Work** - Set it up once and let it handle everything automatically

##  Features

### For Players
- **Easy Account Linking** - Connect your Minecraft account in seconds with `/link`
- **Instant Access** - Get whitelisted and receive your role immediately
- **Account Management** - Check your status or unlink anytime with `/status` and `/unlink`

### For Administrators
- **Complete Database View** - See all linked accounts with `/linkdb`
- **User Lookup** - Instantly check any user's linked account with `/check @user`
- **Flexible Configuration** - Customize roles, admin permissions, and server settings
- **Automated Management** - No more manual whitelist edits or role assignments

##  How It Works

1. **Player links account** → Uses `/link <minecraft-username>`
2. **Bot whitelists automatically** → RCON command executes instantly
3. **Role assigned** → Player receives configured Discord role
4. **Done!** → Player can now join your Minecraft server


##  Quick Start

### Prerequisites
- Node.js 23.1.0 or higher
- A Discord Bot Token ([Get one here](https://discord.com/developers/applications))
- A Minecraft server with RCON enabled

### Installation

1. **Clone and install:**
   ```bash
   git clone https://github.com/yourusername/piggyList.git
   cd piggyList
   npm install
   ```

2. **Configure your bot:**
   - Create a `.env` file in the project root
   - Add your Discord bot token and client ID:
     ```env
     DISCORD_TOKEN=your_bot_token_here
     DISCORD_CLIENT_ID=your_client_id_here
     ```
   
   **Example `.env` file:**
   ```env
   # Discord Bot Token
   # Get your token from https://discord.com/developers/applications
   DISCORD_TOKEN=your_bot_token_here
   
   # Discord Client ID (Application ID)
   # Found in Discord Developer Portal under General Information
   DISCORD_CLIENT_ID=your_client_id_here
   ```

3. **Invite to Discord:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application → OAuth2 > URL Generator
   - Select scopes: `bot` and `applications.commands`
   - Select permissions: `Send Messages`, `Read Message History`, `Manage Roles`, `Use Slash Commands`
   - Invite the bot using the generated URL

4. **Enable RCON on your Minecraft server:**
   ```properties
   # In server.properties
   enable-rcon=true
   rcon.port=25575
   rcon.password=your_secure_password
   ```

5. **Start the bot:**
   ```bash
   npm start
   ```

6. **Configure (Admin only):**
   - `/config-server` - Connect to your Minecraft server
   - `/config-role` - Set the role for linked players
   - `/config-admin-role` - Set admin permissions (optional)

**That's it!** Your bot is ready to start linking accounts. 🎉

## 📋 Commands

### Player Commands
`/link <username>` - Link your Minecraft account and get instant access 
`/unlink` - Unlink your account and remove whitelist access 
`/status` - Check your current account link status 

### Admin Commands
`/config-server` - Configure Minecraft server RCON connection 
`/config-role` - Set the role assigned to linked players 
`/config-admin-role` - Configure admin role permissions 
`/linkdb` - View all linked accounts in the database 
`/check @user` - Check a specific user's linked account 

## 📄 License

**100% Free & Open Source** - PiggyList is completely free to use, modify, and distribute. Licensed under MIT License. No hidden costs, no subscriptions, no premium features—just free software for the community.

---

**Made with ❤️ for the Minecraft community with love from herbs.acab**

