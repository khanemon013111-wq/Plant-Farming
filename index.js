const { Telegraf, Markup } = require('telegraf');
const BOT_TOKEN = '8708342878:AAGHQRmd7jesPpzL3gz3g22akf7gjiuk-ag';
const bot = new Telegraf(BOT_TOKEN);

// আপনার রেন্ডার ইউআরএল (Render URL) এখানে বসবে
const web_link = "https://plant-farming.onrender.com"; 

bot.start((ctx) => {
    return ctx.reply('স্বাগতম দাদু! 🦈\n\nআপনার শার্ক অ্যাপটি চালু করতে নিচের বাটনটি চাপুন।', 
        Markup.keyboard([
            [Markup.button.webApp('🚀 Launch App', web_link)]
        ]).resize()
    );
});

bot.launch();
