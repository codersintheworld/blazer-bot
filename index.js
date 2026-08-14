const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ⚙️ CONFIGURATION 
const VERIFIED_ROLE_ID = '1479598194122948670'; // Replace with your real Role ID number
const TOKEN = process.env.BOT_TOKEN_NEW;       // Leave this exactly as it is!

function generateCaptchaCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

client.once('ready', () => {
    console.log(`🔥 Blazer Bot is online and running! Tag: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has('Administrator')) {
        const embed = new EmbedBuilder()
            .setTitle('🔒 Blazer Bot Verification')
            .setDescription('To get full access to the server channels, click the green button below to solve a quick bot-filter puzzle.')
            .setColor('#5865F2');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('start_verification')
                .setLabel('Verify Me')
                .setStyle(ButtonStyle.Success)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'start_verification') {
            const secretCode = generateCaptchaCode();
            const puzzleDisplay = `| ${secretCode.split('').join('  |  ')} |`;

            const modal = new ModalBuilder()
                .setCustomId(`submit_captcha_${secretCode}`)
                .setTitle('Security Test');

            const textInput = new TextInputBuilder()
                .setCustomId('user_input')
                .setLabel(`Type this exact text (Case-Sensitive): ${puzzleDisplay}`)
                .setPlaceholder('Enter 5-character code here...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5);

            const row = new ActionRowBuilder().addComponents(textInput);
            modal.addComponents(row);

            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('submit_captcha_')) {
            const correctCode = interaction.customId.replace('submit_captcha_', '');
            const userAnswer = interaction.fields.getTextInputValue('user_input').trim().toUpperCase();

            if (userAnswer === correctCode) {
                const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
                if (role) {
                    await interaction.member.roles.add(role);
                    await interaction.reply({ content: '✅ **Verification Passed!** You now have access to the server.', ephemeral: true });
                } else {
                    await interaction.reply({ content: '⚠️ Role config error! Tell an admin the role ID is invalid.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: '❌ **Wrong code!** Click the verification button again to fetch a fresh security code.', ephemeral: true });
            }
        }
    }
});

client.login(TOKEN);

// Dummy server to pass Render port scan checks
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Blazer Bot Running Safely\n');
});

// Render automatically passes a PORT variable. If missing, it defaults to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`📡 Internal web server is actively listening on port ${PORT}`);
});
