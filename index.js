const { Telegraf, Markup } = require('telegraf');
const admin = require('firebase-admin');

// আপনার তথ্য
const BOT_TOKEN = '8708342878:AAGHQRmd7jesPpzL3gz3g22akf7gjiuk-ag';
const DB_URL = 'https://shark-bot-c515b-default-rtdb.firebaseio.com';
const serviceAccount = require("./key.json");

// ফায়ারবেস ডাটাবেস কানেক্ট
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: DB_URL
  });
}

const db = admin.database();
const bot = new Telegraf(BOT_TOKEN);

// স্টার্ট কমান্ড - এখানে একটি মেনু আসবে
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const userRef = db.ref(`users/${userId}`);
  const snapshot = await userRef.once('value');
  
  if (!snapshot.exists()) {
    await userRef.set({
      balance: 0,
      username: ctx.from.username || "Player"
    });
  }

  return ctx.reply(`স্বাগতম দাদু! 🦈\n\nএটি একটি NotCoin স্টাইল মাইনিং বট। নিচের বাটনে ক্লিক করে শার্ক কয়েন আয় করুন!`, 
    Markup.inlineKeyboard([
      [Markup.button.callback('🪙 Tap to Earn (+10)', 'tap_coin')],
      [Markup.button.callback('📊 My Balance', 'show_balance')]
    ])
  );
});

// ট্যাপ করার মেকানিজম
bot.action('tap_coin', async (ctx) => {
  const userId = ctx.from.id;
  const userRef = db.ref(`users/${userId}/balance`);
  
  await userRef.transaction((currentBalance) => {
    return (currentBalance || 0) + 10;
  });

  const snapshot = await userRef.once('value');
  const newBalance = snapshot.val();

  await ctx.answerCbQuery('১০ কয়েন আয় করেছেন! 🪙');
  
  return ctx.editMessageText(`মাশাআল্লাহ দাদু! আপনি ট্যাপ করছেন।\n\nআপনার বর্তমান সঞ্চয়: ${newBalance} কয়েন। 💰`, 
    Markup.inlineKeyboard([
      [Markup.button.callback('🪙 Tap Again! (+10)', 'tap_coin')],
      [Markup.button.callback('📊 My Balance', 'show_balance')]
    ])
  );
});

// ব্যালেন্স দেখার অপশন
bot.action('show_balance', async (ctx) => {
  const userId = ctx.from.id;
  const snapshot = await db.ref(`users/${userId}/balance`).once('value');
  const balance = snapshot.val() || 0;
  
  ctx.reply(`দাদু, আপনার মোট ব্যালেন্স: ${balance} শার্ক কয়েন। 🦈`);
  return ctx.answerCbQuery();
});

bot.launch();
console.log("বট গিটহাব থেকে রেন্ডারে সফলভাবে চলছে...");
