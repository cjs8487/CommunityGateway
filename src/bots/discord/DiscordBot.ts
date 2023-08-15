import {
    Client,
    GatewayIntentBits,
    Interaction,
    REST,
    Routes,
    time,
} from 'discord.js';
import { logInfo } from '../../Logger';
import { discordBotToken, discordCommandServerId } from '../../Environment';
import { commandList } from './commands/CommandList';
import buttonHandlers from './commands/components/ButtonList';
import { editMessage } from './util/MessageUtils';
import { syncAll } from './modules/DataSync';

export const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

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

    editMessage(
        '1137917791190650911',
        '1137917792373448726',
        '1138675653894484003',
        `Bot launched at ${time(
            // eslint-disable-next-line no-bitwise
            (Date.now() / 1000) >>> 0,
        )}`,
    );
    syncAll();

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

export const init = async () => {
    client.once('ready', onReady);
    client.login(discordBotToken);
    client.on('interactionCreate', onInteraction);
    // const channel = await (
    //     await client.guilds.fetch('1137917791190650911')
    // ).channels.fetch('1137917792373448726');
    // if (channel?.isTextBased()) {
    //     (await channel.messages.fetch('1138675653894484003')).edit(
    //         `Bot launched at ${time(
    //             // eslint-disable-next-line no-bitwise
    //             (Date.now() / 1000) >>> 0,
    //         )}`,
    //     );
    // }
};

export default {};
