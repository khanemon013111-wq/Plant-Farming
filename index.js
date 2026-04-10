const { Telegraf, Markup } = require('telegraf');
const admin = require('firebase-admin');

// --- সেটিংস ---
const BOT_TOKEN = '8708342878:AAGHQRmd7jesPpzL3gz3g22akf7gjiuk-ag';
const DB_URL = 'https://shark-bot-c515b-default-rtdb.firebaseio.com';
const serviceAccount = require("./key.json");

// ফায়ারবেস কানেক্ট করা
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: DB_URL
  });
}

const db = admin.database();
const bot = new Telegraf(BOT_TOKEN);

// স্টার্ট কমান্ড দিলে ওয়েব অ্যাপ বাটন আসবে
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const userRef = db.ref(`users/${userId}`);
  const snapshot = await userRef.once('value');
  
  if (!snapshot.exists()) {
    await userRef.set({
      balance: 0,
      username: ctx.from.username || "Player",
      joinedAt: Date.now()
    });
  }

  // এখানে আমরা একটি ওয়েব অ্যাপ বাটন দিচ্ছি
  return ctx.reply(`স্বাগতম দাদু! 🦈\n\nআপনার শার্ক মাইনিং অ্যাপটি নিচের বাটনে ক্লিক করে চালু করুন।`, 
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Launch Shark App', 'https://shark-miner.vercel.app')], // এখানে আপনার অ্যাপের লিঙ্ক হবে
      [Markup.button.callback('📊 Check Balance', 'show_balance')]
    ])
  );
});

// ব্যালেন্স চেক (চ্যাটেই দেখা যাবে)
bot.action('show_balance', async (ctx) => {
  const userId = ctx.from.id;
  const snapshot = await db.ref(`users/${userId}/balance`).once('value');
  const balance = snapshot.val() || 0;
  ctx.answerCbQuery();
  ctx.reply(`দাদু, আপনার বর্তমান ব্যালেন্স: ${balance} শার্ক কয়েন। 💰`);
});

bot.launch();
console.log("Shark Mini App Bot is running via GitHub & Render...");
