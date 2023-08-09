import {
    Client,
    GatewayIntentBits,
    Interaction,
    REST,
    Routes,
} from 'discord.js';
import { logInfo } from '../../Logger';
import { discordBotToken, discordCommandServerId } from '../../Environment';
import { commandList } from './commands/CommandList';
import buttonHandlers from './commands/components/ButtonList';

export const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const onReady = async (c: Client<true>) => {
    const rest = new REST({ version: '10' }).setToken(discordBotToken);

    const commandData = commandList.map((command) => command.data.toJSON());

    await rest.put(
        Routes.applicationGuildCommands(
            c.user.id || 'missing id',
            discordCommandServerId,
        ),
        { body: commandData },
    );

    c.user?.setPresence({
        status: 'online',
        activities: [
            {
                name: 'At your service Master Shortpants',
            },
        ],
    });

    logInfo(`Discord bot initialized and logged in as ${c.user.tag}`);
};

const onInteraction = async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        commandList.forEach((command) => {
            if (interaction.commandName === command.data.name) {
                command.run(interaction);
            }
        });
    } else if (interaction.isButton()) {
        const handler = buttonHandlers.get(interaction.customId);
        if (handler) {
            handler(interaction);
        } else {
            await interaction.reply({
                content: 'You clicked an unknown button',
                ephemeral: true,
            });
        }
    }
};

export const init = () => {
    client.once('ready', onReady);
    client.login(discordBotToken);
    client.on('interactionCreate', onInteraction);
};

export default {};
