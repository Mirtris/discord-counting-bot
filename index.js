const { Client, Intents, MessageEmbed, Role } = require('discord.js');
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);

let data = {
    prefix: "!!",
    token: "your-token",
    countingChannel: "",
    currenCountUser: "",
    lastCountUser: "",
    roleId: "",
    isCounting: false,
    currentCount: 0
}

const client = new Client({ intents: myIntents })

client.on('ready', () => {
    console.log('Hello, I am alive.');
})

// 接受訊息
client.on("messageCreate", async (message) => {
    let lastCount = data.currentCount - 1;
    let nextCount = data.currentCount + 1;

    const args = message.content.slice(data.prefix.length).split(" ")

    switch (args[0]) {
        case "count":
            message.react('😎')

            const startEmbed = new MessageEmbed();
            startEmbed.setTitle(`<:cuteca:848617481983098961>  從${data.currentCount + 1}開始 !`);
            startEmbed.setColor('#5865F2')



            if (!data.isCounting) {
                data.currenCountUser = message.author.id;
                data.countingChannel = message.channel.id;
                // create the role of counting

                await message.guild.roles.create({
                    name: `${data.currentCount}`,
                    color: '#5a3bd9',
                    reason: '測試'
                })
                    .then(role => (data.roleId = role.id))
                    .catch(err => console.log(err))
                // add the role to who start counting
                if (!message.member.roles.cache.some(role => role.id === `${data.roleId}`)) {
                    message.member.roles.add(`${data.roleId}`)
                        .then(console.log(`Succesfuly added role to member ${message.author.tag}`))
                        .catch(console.error)
                }
                // edit the channel name
                // Discord had set the rate limit for things like channelrename to 2 requests per 10 minutes
                message.channel.setName(`conting-to-${data.currentCount}`)
                // start Counting
                data.isCounting = true
            }
            return message.reply({
                embeds: [startEmbed]
            })
    }


    if (message.content == `${nextCount}`) {
        message.react('😎');
        // edit channel name
        message.channel.setName(`conting-to-${data.currentCount}`)

        // 移除前一個counting的身份
        data.lastCountUser = data.currenCountUser
        data.currenCountUser = message.author.id
        let removeRole = message.guild.members.cache.get(data.lastCountUser)
        removeRole.roles.remove(data.roleId)

        // edit the role name 
        let RoleName = message.guild.roles.cache.get(data.roleId)
        RoleName.edit({ name: `${nextCount}` })
            .then(updated => console.log(`Edited role name to ${updated.name}`))

        // update the role to countting user
        let AddRole = message.guild.members.cache.get(data.currenCountUser)
        AddRole.roles.add(data.roleId)

        data.currentCount++;
    }

})

client.login(data.token);