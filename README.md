# 🎵 Israeli Radio Discord Bot

A Discord bot that streams Israeli radio stations directly to voice channels.

## Features

- 🇮🇱 **10+ Israeli Radio Stations** - Galgalatz, Kan 88, Radio 103FM, and more
- 🎛️ **Volume Control** - Adjust playback volume (1-100%)
- 📻 **Easy Commands** - Simple slash commands for all functions
- 🔄 **Auto-Reconnect** - Automatically reconnects if stream drops
- 🐳 **Docker Ready** - Easy deployment with Docker

## Quick Setup

1. **Clone and install:**
```bash
git clone https://github.com/bytorbix/israeli--radio-discord-bot.git
cd israeli--radio-discord-bot
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Add your Discord bot token to .env
```

3. **Run the bot:**
```bash
npm start
```

## Commands

- `/join` - Join your voice channel
- `/play <station>` - Play Israeli radio station
- `/volume <1-100>` - Adjust volume
- `/stations` - List all available stations
- `/stop` - Stop radio
- `/leave` - Leave voice channel

## Available Stations

- גלגל"צ (Galgalatz) - IDF Radio
- כאן 88 (Kan 88) - Public Broadcasting
- רדיו 103FM - Popular Israeli radio
- כאן גימל (Kan Gimmel) - Israeli music
- And more...

## Docker Deployment

```bash
docker-compose up -d
```

## Requirements

- Node.js 16+
- Discord Bot Token
- FFmpeg (auto-installed with Docker)

## License

MIT
