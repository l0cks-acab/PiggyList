# 📦 Installation Guide

Complete step-by-step guide to installing and setting up PiggyList Discord Bot.

## Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 23.1.0 or higher** - [Download here](https://nodejs.org/)
- ✅ **A Discord Bot Application** - [Create one here](https://discord.com/developers/applications)
- ✅ **A Minecraft Server** with RCON enabled
- ✅ **Basic command line knowledge**

---

## Step 1: Create Your Discord Bot

1. **Go to the Discord Developer Portal**
   - Visit [https://discord.com/developers/applications](https://discord.com/developers/applications)
   - Log in with your Discord account

2. **Create a New Application**
   - Click the **"New Application"** button
   - Give it a name (e.g., "PiggyList Bot")
   - Click **"Create"**

3. **Get Your Bot Token**
   - Go to the **"Bot"** section in the left sidebar
   - Click **"Add Bot"** and confirm
   - Under **"Token"**, click **"Reset Token"** or **"Copy"**
   - ⚠️ **IMPORTANT:** Save this token securely! You'll need it later.

4. **Get Your Application (Client) ID**
   - Go to the **"General Information"** section
   - Copy the **"Application ID"** - You'll need this too!

5. **Configure Bot Settings**
   - In the **"Bot"** section, enable:
     - ✅ **Public Bot** (if you want others to invite it)
     - ✅ **Message Content Intent** (under "Privileged Gateway Intents")
   - Click **"Save Changes"**

---

## Step 2: Invite Bot to Your Discord Server

1. **Generate Invite URL**
   - Go to **"OAuth2"** → **"URL Generator"** in the left sidebar
   - Under **"Scopes"**, select:
     - ✅ `bot`
     - ✅ `applications.commands`
   - Under **"Bot Permissions"**, select:
     - ✅ `Send Messages`
     - ✅ `Read Message History`
     - ✅ `Manage Roles`
     - ✅ `Use Slash Commands`
   - Copy the generated URL at the bottom

2. **Invite the Bot**
   - Paste the URL in your browser
   - Select your Discord server
   - Click **"Authorize"**
   - Complete any CAPTCHA if prompted

---

## Step 3: Enable RCON on Your Minecraft Server

1. **Edit server.properties**
   - Open your Minecraft server's `server.properties` file
   - Find or add these lines:
     ```properties
     enable-rcon=true
     rcon.port=25575
     rcon.password=your_secure_password_here
     ```
   - ⚠️ **Important:** Choose a strong password for RCON!

2. **Restart Your Server**
   - Save the `server.properties` file
   - Restart your Minecraft server for changes to take effect

3. **Verify RCON is Working**
   - You can test RCON using an RCON client or wait until bot setup is complete

---

## Step 4: Install PiggyList Bot

### Option A: Using Git (Recommended)

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd piggyList
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

### Option B: Manual Download

1. **Download the Project**
   - Download the project files as a ZIP
   - Extract to your desired location

2. **Open Terminal/Command Prompt**
   - Navigate to the project folder:
     ```bash
     cd path/to/piggyList
     ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

---

## Step 5: Configure Environment Variables

1. **Create .env File**
   - In the project root, create a file named `.env`
   - You can copy `.env.example` if it exists:
     ```bash
     cp .env.example .env
     ```

2. **Add Your Credentials**
   - Open `.env` in a text editor
   - Add your Discord bot token and client ID:
     ```
     DISCORD_TOKEN=your_bot_token_from_step_1
     DISCORD_CLIENT_ID=your_application_id_from_step_1
     ```
   - Replace the placeholder values with your actual credentials

3. **Save the File**
   - Make sure to save the `.env` file
   - ⚠️ **Never commit `.env` to version control!**

---

## Step 6: Start the Bot

1. **Run the Bot**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. **Verify It's Running**
   - You should see:
     ```
     ✅ Bot is ready! Logged in as YourBotName#1234
     📊 Bot is in X guild(s)
     Started refreshing application (/) commands.
     Successfully registered application (/) commands.
     ```

3. **Test in Discord**
   - Go to your Discord server
   - Type `/` and you should see PiggyList commands appear
   - If commands don't appear, wait a few minutes (Discord can take up to an hour to register commands)

---

## Step 7: Configure the Bot (Admin Only)

Once the bot is running, configure it using these commands in Discord:

### 1. Configure Minecraft Server Connection

```
/config-server host:your.server.ip password:your_rcon_password port:25575
```

- Replace `your.server.ip` with your server's IP address
- Replace `your_rcon_password` with the RCON password from Step 3
- Port is optional (defaults to 25575)

**Example:**
```
/config-server host:192.168.1.100 password:MySecurePassword123 port:25575
```

### 2. Set Linked Role

```
/config-role role:@LinkedPlayers
```

- Replace `@LinkedPlayers` with the role you want to assign to linked players
- The bot must have permission to assign this role
- Make sure the bot's role is above this role in the hierarchy

### 3. (Optional) Set Admin Role

```
/config-admin-role role:@Admins
```

- Replace `@Admins` with the role that should have admin permissions
- Users with this role can use admin commands

---

## Step 8: Test the Setup

1. **Test Account Linking**
   - Use `/link your-minecraft-username` as a regular user
   - You should be whitelisted and receive the configured role

2. **Test Admin Commands**
   - Use `/linkdb` to see all linked accounts
   - Use `/check @user` to check a specific user's account

3. **Verify Minecraft Whitelist**
   - Check your Minecraft server console or use `/whitelist list` via RCON
   - The linked username should appear in the whitelist

---

## 🎉 Installation Complete!

Your PiggyList bot is now set up and ready to use! Players can now link their accounts using `/link` and will be automatically whitelisted.

---

## Troubleshooting

### Bot Won't Start

- **Check Node.js version:** Run `node --version` (should be 23.1.0+)
- **Check .env file:** Make sure DISCORD_TOKEN and DISCORD_CLIENT_ID are set
- **Check dependencies:** Run `npm install` again

### Commands Not Appearing

- **Wait up to 1 hour** - Discord can take time to register commands
- **Check bot permissions** - Make sure bot has "Use Slash Commands" permission
- **Restart the bot** - Sometimes a restart helps

### RCON Connection Fails

- **Check server.properties** - Verify RCON is enabled
- **Check firewall** - Make sure RCON port (25575) is open
- **Verify credentials** - Double-check IP, port, and password
- **Test RCON manually** - Use an RCON client to verify it works

### Role Not Assigning

- **Check bot permissions** - Bot needs "Manage Roles" permission
- **Check role hierarchy** - Bot's role must be above the role it's assigning
- **Verify role exists** - Make sure the role you configured actually exists

### Still Having Issues?

- Check the main [README.md](README.md) for more information
- Review error messages in the console for specific issues
- Make sure all prerequisites are met

---

## Next Steps

- Read the [README.md](README.md) for feature overview
- Customize roles and permissions to fit your server
- Invite your community to start linking accounts!

**Happy linking! 🐷**

