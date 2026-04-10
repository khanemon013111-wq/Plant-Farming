const { Telegraf, Markup } = require('telegraf');
const admin = require('firebase-admin');

// আপনার তথ্য
const BOT_TOKEN = '8708342878:AAGHQRmd7jesPpzL3gz3g22akf7gjiuk-ag';
const DB_URL = 'https://shark-bot-c515b-default-rtdb.firebaseio.com';
const serviceAccount = require("./key.json");

// ফায়ারবেস কানেক্ট
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DB_URL
});

const db = admin.database();
const bot = new Telegraf(BOT_TOKEN);

// ২০টি প্ল্যান্টের লিস্ট
const plants = {
    p1: { name: "Seaweed Sprout", price: 0, income: 5 },
    p2: { name: "Coral Vine", price: 200, income: 15 },
    p3: { name: "Neon Moss", price: 500, income: 40 },
    p4: { name: "Shark Fin Bush", price: 1200, income: 100 },
    p5: { name: "Blue Anemone", price: 3000, income: 250 },
    p6: { name: "Deep Sea Fern", price: 6500, income: 550 },
    p7: { name: "Glow Root", price: 12000, income: 1100 },
    p8: { name: "Bubble Flower", price: 25000, income: 2400 },
    p9: { name: "Pearl Orchid", price: 50000, income: 5000 },
    p10: { name: "Storm Kelp", price: 100000, income: 11000 },
    p11: { name: "Crystal Lily", price: 200000, income: 23000 },
    p12: { name: "Aqua Rose", price: 450000, income: 50000 },
    p13: { name: "Hydra Leaf", price: 900000, income: 105000 },
    p14: { name: "Kraken Vine", price: 1800000, income: 220000 },
    p15: { name: "Titan Oak", price: 3500000, income: 450000 },
    p16: { name: "Mystic Algae", price: 7000000, income: 950000 },
    p17: { name: "Solar Coral", price: 15000000, income: 2100000 },
    p18: { name: "Lunar Lotus", price: 35000000, income: 5000000 },
    p19: { name: "Galaxy Grass", price: 80000000, income: 12000000 },
    p20: { name: "Shark King Tree", price: 200000000, income: 35000000 }
};

bot.start(async (ctx) => {
    const uid = ctx.from.id;
    const userRef = db.ref('users/' + uid);
    const snap = await userRef.once('value');

    if (!snap.exists()) {
        await userRef.set({ balance: 0, last_claim: 0, current_plant: 'p1' });
        ctx.reply('শুভেচ্ছা দাদু! আপনার শার্ক ফার্মিং শুরু হলো। /claim লিখে আয় শুরু করুন।');
    } else {
        ctx.reply('স্বাগতম! আপনার ফার্মে কাজ চলছে। আপনার ব্যালেন্স দেখতে /status লিখুন।');
    }
});

bot.command('claim', async (ctx) => {
    const uid = ctx.from.id;
    const userRef = db.ref('users/' + uid);
    const snap = await userRef.once('value');
    const user = snap.val();

    const now = Date.now();
    const wait = 8 * 60 * 60 * 1000; // ৮ ঘণ্টা

    if (now - user.last_claim >= wait) {
        const income = plants[user.current_plant].income;
        await userRef.update({ balance: user.balance + income, last_claim: now });
        ctx.reply(`অভিনন্দন! আপনি ${income} SHARK কয়েন মাইন করেছেন।`);
    } else {
        const diff = wait - (now - user.last_claim);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        ctx.reply(`দাদু, আরও ${hours} ঘণ্টা ${mins} মিনিট পর আবার ক্লেইম করতে পারবেন।`);
    }
});

bot.command('status', async (ctx) => {
    const uid = ctx.from.id;
    const snap = await db.ref('users/' + uid).once('value');
    const user = snap.val();
    ctx.reply(`আপনার বর্তমান ব্যালেন্স: ${user.balance} SHARK\nবর্তমান গাছ: ${plants[user.current_plant].name}`);
});

bot.launch();
console.log("বট চালু হয়েছে...");
