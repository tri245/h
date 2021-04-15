// Dependencies
const { WarningSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class ClearWarning extends Command {
	constructor(bot) {
		super(bot, {
			name: 'clear-warning',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['cl-warning', 'cl-warnings', 'clear-warnings'],
			userPermissions: ['KICK_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Remove warnings from a user.',
			usage: 'clear-warning <user>',
			cooldown: 5000,
			examples: ['clear-warning username'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check to see if user can kick members
		if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		// Get user
		const member = message.getMember();

		// get warnings of user
		try {
			// find data
			const data = await WarningSchema.findOne({
				userID: member[0].id,
				guildID: message.guild.id,
			});

			// Delete the data
			if (data) {
				await WarningSchema.deleteOne(data, function(err) {
					if (err) throw err;
				});
				message.channel.success(settings.Language, 'MODERATION/CLEARED_WARNINGS', member[0]).then(m => m.delete({ timeout: 10000 }));
			} else {
				message.channel.send(bot.translate(settings.Language, 'MODERATION/NO_WARNINGS')).then(m => m.delete({ timeout: 3500 }));
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
