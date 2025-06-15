# 🎵 Israeli Radio Discord Bot

A Discord bot that streams Israeli radio stations directly to voice channels.

## Features

- 🇮🇱 **10+ Israeli Radio Stations** - Galgalatz, Kan 88, Radio 103FM, and more
- 🎛️ **Volume Control** - Adjust playback volume (1-100%)
- 📻 **Easy Commands** - Simple slash commands for all functions
- 🔄 **Auto-Reconnect** - Automatically reconnects if stream drops
- 🐳 **Docker Ready** - One-command deployment with Docker

## Quick Setup

### 🐳 Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/bytorbix/israeli--radio-discord-bot.git
cd israeli--radio-discord-bot

# Configure environment
cp .env.example .env
# Add your Discord bot token to .env

# Deploy with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

### 💻 Manual Setup

```bash
# Clone and install
git clone https://github.com/bytorbix/israeli--radio-discord-bot.git
cd israeli--radio-discord-bot
npm install

# Configure environment
cp .env.example .env
# Add your Discord bot token to .env

# Run the bot
npm start
```

## Commands

- `/join` - Join your voice channel
- `/play <station>` - Play Israeli radio station
- `/volume <1-100>` - Adjust volume
- `/stations` - List all available stations
- `/stop` - Stop radio
- `/leave` - Leave voice channel
- `/nowplaying` - Show currently playing station

## Available Stations

- **גלגל"צ (Galgalatz)** - IDF Radio
- **כאן 88 (Kan 88)** - Public Broadcasting
- **רדיו 103FM** - Popular Israeli radio
- **כאן גימל (Kan Gimmel)** - Israeli music
- **רדיו תל אביב 102FM** - Tel Aviv radio
- **קול רגע 96FM** - Northern Israel radio
- **רדיו 90FM** - Music & Entertainment
- **רדיו דרום** - Southern Israel radio
- **קול חי (Kol Chai)** - Religious radio
- And more...

## Docker Management

```bash
# Start bot
docker-compose up -d

# Stop bot
docker-compose down

# View logs
docker-compose logs -f

# Restart bot
docker-compose restart

# Update bot
git pull origin main
docker-compose up -d --build
```

## Cloud Deployment

Deploy on any server with Docker:

```bash
# Example: DigitalOcean/AWS/GCP
git clone https://github.com/bytorbix/israeli--radio-discord-bot.git
cd israeli--radio-discord-bot
cp .env.example .env
nano .env  # Add your Discord bot token
docker-compose up -d
```

## Requirements

- **Docker & Docker Compose** (for Docker deployment)
- **OR Node.js 16+** (for manual setup)
- **Discord Bot Token** ([Get one here](https://discord.com/developers/applications))
- **FFmpeg** (auto-installed with Docker)

## Environment Setup

Create a `.env` file with your Discord bot token:

```bash
DISCORD_BOT_TOKEN=your_discord_bot_token_here
NODE_ENV=production
```

## License

MIT
