// Load environment variables first
require('dotenv').config();

const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

// Israeli radio stations - Updated with verified working URLs
const RADIO_STATIONS = {
    'galgalatz': {
        name: 'גלגל"צ (Galgalatz)',
        url: 'http://glzwizzlv.bynetcdn.com/glglz_mp3',
        description: 'IDF Radio - רדיו צה"ל'
    },
    'galatz': {
        name: 'גל"צ (Galatz)',
        url: 'http://glzwizzlv.bynetcdn.com/glglz_mp3',
        description: 'IDF Army Radio'
    },
    'kan88': {
        name: 'כאן 88 (Kan 88)',
        url: 'https://kan-media-prod.azureedge.net/hls/live/2024680/kan88/kan88.m3u8',
        description: 'Public Broadcasting Corporation'
    },
    'kanbet': {
        name: 'כאן ב (Kan Bet)',
        url: 'https://kanlivep2event-i.akamaihd.net/hls/live/749624/749624/kanbet_mp3/chunklist.m3u8',
        description: 'Public radio - News & Talk'
    },
    'kangimel': {
        name: 'כאן גימל (Kan Gimmel)',
        url: 'http://radiocast-rr-d.vidnt.com/ipbc_IPBCgimmelLAM',
        description: 'Israeli music - רק מוזיקה ישראלית'
    },
    'radio102': {
        name: 'רדיו תל אביב 102FM',
        url: 'https://s2.radio.co/s2b2b68744/listen',
        description: 'Tel Aviv radio station'
    },
    'kol-rega': {
        name: 'קול רגע 96FM',
        url: 'https://live.kolrega.co.il/live',
        description: 'Northern Israel radio'
    },
    'radio90': {
        name: 'רדיו 90FM',
        url: 'https://live.90fm.co.il/live',
        description: 'Music & Entertainment'
    },
    'radio-darom': {
        name: 'רדיו דרום',
        url: 'https://live.radiodarom.co.il/live',
        description: 'Southern Israel radio'
    },
    'kol-chai': {
        name: 'קול חי (Kol Chai)',
        url: 'https://live.kolchai.com/live',
        description: 'Religious radio station'
    }
};

// Configuration from environment variables
const DEFAULT_VOLUME = parseFloat(process.env.DEFAULT_VOLUME || '0.3');
const AUTO_RECONNECT = process.env.AUTO_RECONNECT !== 'false';

// Bot state
const connections = new Map();
const players = new Map();

client.once('ready', async () => {
    console.log(`🎵 Israeli Radio Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Register slash commands
    const commands = [
        new SlashCommandBuilder()
            .setName('join')
            .setDescription('Join your voice channel'),
        
        new SlashCommandBuilder()
            .setName('leave')
            .setDescription('Leave the voice channel'),
        
        new SlashCommandBuilder()
            .setName('play')
            .setDescription('Play an Israeli radio station')
            .addStringOption(option =>
                option.setName('station')
                    .setDescription('Choose a radio station')
                    .setRequired(true)
                    .addChoices(
                        ...Object.entries(RADIO_STATIONS).map(([key, station]) => ({
                            name: station.name,
                            value: key
                        }))
                    )),
        
        new SlashCommandBuilder()
            .setName('stop')
            .setDescription('Stop playing radio'),
        
        new SlashCommandBuilder()
            .setName('stations')
            .setDescription('List all available Israeli radio stations'),
        
        new SlashCommandBuilder()
            .setName('nowplaying')
            .setDescription('Show currently playing station'),
        
        new SlashCommandBuilder()
            .setName('volume')
            .setDescription('Set the radio volume')
            .addIntegerOption(option =>
                option.setName('level')
                    .setDescription('Volume level (1-100)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(100))
    ];

    try {
        await client.application.commands.set(commands);
        console.log('📻 Slash commands registered successfully!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, guildId } = interaction;

    try {
        switch (commandName) {
            case 'join':
                await handleJoin(interaction);
                break;
            case 'leave':
                await handleLeave(interaction);
                break;
            case 'play':
                await handlePlay(interaction);
                break;
            case 'stop':
                await handleStop(interaction);
                break;
            case 'stations':
                await handleStations(interaction);
                break;
            case 'nowplaying':
                await handleNowPlaying(interaction);
                break;
            case 'volume':
                await handleVolume(interaction);
                break;
        }
    } catch (error) {
        console.error(`Error handling command ${commandName}:`, error);
        await interaction.reply({ 
            content: '❌ An error occurred while processing your command.', 
            ephemeral: true 
        });
    }
});

async function handleJoin(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    
    if (!voiceChannel) {
        return interaction.reply({ 
            content: '❌ You need to be in a voice channel!', 
            ephemeral: true 
        });
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    connections.set(interaction.guildId, connection);

    connection.on(VoiceConnectionStatus.Ready, () => {
        console.log(`✅ Connected to voice channel in ${interaction.guild.name}`);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5000),
            ]);
        } catch (error) {
            connection.destroy();
            connections.delete(interaction.guildId);
        }
    });

    await interaction.reply(`🎵 Joined **${voiceChannel.name}**! Use \`/play\` to start a radio station.`);
}

async function handleLeave(interaction) {
    const connection = connections.get(interaction.guildId);
    const playerData = players.get(interaction.guildId);

    if (playerData) {
        playerData.player.stop();
        players.delete(interaction.guildId);
    }

    if (connection) {
        connection.destroy();
        connections.delete(interaction.guildId);
        await interaction.reply('👋 Left the voice channel!');
    } else {
        await interaction.reply({ 
            content: '❌ I\'m not in a voice channel!', 
            ephemeral: true 
        });
    }
}

async function handlePlay(interaction) {
    await interaction.deferReply();

    const connection = connections.get(interaction.guildId);
    if (!connection) {
        return interaction.editReply('❌ I need to join a voice channel first! Use `/join`');
    }

    const stationKey = interaction.options.getString('station');
    const station = RADIO_STATIONS[stationKey];

    try {
        // Stop current player if exists
        const currentPlayerData = players.get(interaction.guildId);
        if (currentPlayerData) {
            currentPlayerData.player.stop();
        }

        // Create new audio player
        const player = createAudioPlayer();
        const resource = createAudioResource(station.url, {
            inputType: 'url',
            inlineVolume: true
        });

        // Set volume
        if (resource.volume) {
            resource.volume.setVolume(DEFAULT_VOLUME);
        }

        player.play(resource);
        connection.subscribe(player);
        players.set(interaction.guildId, { player, station, stationKey, resource });

        player.on(AudioPlayerStatus.Playing, () => {
            console.log(`🎵 Now playing ${station.name}`);
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log(`⏹️ Finished playing ${station.name}`);
            // Auto-reconnect for radio streams if enabled
            if (AUTO_RECONNECT) {
                setTimeout(() => {
                    if (players.has(interaction.guildId)) {
                        const newResource = createAudioResource(station.url, {
                            inputType: 'url',
                            inlineVolume: true
                        });
                        if (newResource.volume) {
                            newResource.volume.setVolume(DEFAULT_VOLUME);
                        }
                        player.play(newResource);
                    }
                }, 2000);
            }
        });

        player.on('error', error => {
            console.error(`❌ Audio player error:`, error);
        });

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🎵 Now Playing')
            .setDescription(`**${station.name}**\n${station.description}`)
            .addFields(
                { name: '📻 Station', value: station.name, inline: true },
                { name: '🎶 Type', value: station.description, inline: true },
                { name: '🔊 Volume', value: `${Math.round(DEFAULT_VOLUME * 100)}%`, inline: true }
            )
            .setFooter({ text: 'Israeli Radio Bot | Use /volume to adjust volume' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error playing radio:', error);
        await interaction.editReply('❌ Failed to play radio station. Please try again.');
    }
}

async function handleStop(interaction) {
    const playerData = players.get(interaction.guildId);

    if (!playerData) {
        return interaction.reply({ 
            content: '❌ No radio is currently playing!', 
            ephemeral: true 
        });
    }

    playerData.player.stop();
    players.delete(interaction.guildId);

    await interaction.reply('⏹️ Stopped playing radio.');
}

async function handleVolume(interaction) {
    const playerData = players.get(interaction.guildId);
    
    if (!playerData) {
        return interaction.reply({ 
            content: '❌ No radio is currently playing!', 
            ephemeral: true 
        });
    }

    const volume = interaction.options.getInteger('level');
    const volumeFloat = volume / 100;

    if (playerData.resource && playerData.resource.volume) {
        playerData.resource.volume.setVolume(volumeFloat);
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🔊 Volume Updated')
            .setDescription(`Volume set to **${volume}%**`)
            .addFields(
                { name: '📻 Station', value: playerData.station.name, inline: true },
                { name: '🔊 New Volume', value: `${volume}%`, inline: true }
            )
            .setFooter({ text: 'Israeli Radio Bot' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } else {
        await interaction.reply({ 
            content: '❌ Unable to adjust volume for this stream.', 
            ephemeral: true 
        });
    }
}

async function handleStations(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📻 Available Israeli Radio Stations')
        .setDescription('Here are all the available radio stations:')
        .setFooter({ text: 'Use /play <station> to start listening!' })
        .setTimestamp();

    Object.entries(RADIO_STATIONS).forEach(([key, station]) => {
        embed.addFields({
            name: station.name,
            value: station.description,
            inline: true
        });
    });

    await interaction.reply({ embeds: [embed] });
}

async function handleNowPlaying(interaction) {
    const playerData = players.get(interaction.guildId);

    if (!playerData) {
        return interaction.reply({ 
            content: '❌ No radio is currently playing!', 
            ephemeral: true 
        });
    }

    const { station } = playerData;
    const currentVolume = playerData.resource && playerData.resource.volume 
        ? Math.round(playerData.resource.volume.volume * 100) 
        : Math.round(DEFAULT_VOLUME * 100);

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🎵 Currently Playing')
        .setDescription(`**${station.name}**\n${station.description}`)
        .addFields(
            { name: '📻 Station', value: station.name, inline: true },
            { name: '🎶 Type', value: station.description, inline: true },
            { name: '🔊 Volume', value: `${currentVolume}%`, inline: true }
        )
        .setFooter({ text: 'Israeli Radio Bot | Use /volume to adjust' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down Israeli Radio Bot...');
    
    // Clean up connections
    connections.forEach(connection => {
        connection.destroy();
    });
    
    // Stop all players
    players.forEach(playerData => {
        playerData.player.stop();
    });
    
    client.destroy();
    process.exit(0);
});

// Validate required environment variables
if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('❌ DISCORD_BOT_TOKEN environment variable is required!');
    console.error('💡 Make sure you have a .env file with: DISCORD_BOT_TOKEN=your_token_here');
    process.exit(1);
}

// Login with bot token from environment variable
client.login(process.env.DISCORD_BOT_TOKEN);