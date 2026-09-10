const { Telegraf } = require('telegraf');
const express = require('express');

// ১. Render Sleep Mode ঠেকানোর জন্য Express Web Server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running ultra fast 24/7!');
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

// ২. টেলিগ্রাম বট কনফিগারেশন
const BOT_TOKEN = '8928009450:AAF1kacThOZUMgnD9yBHSlcUvA1yINLBpGA';
const bot = new Telegraf(BOT_TOKEN);

// /start কমান্ড
bot.start((ctx) => {
  ctx.reply('বট অ্যাক্টিভ আছে! যেকোনো মেসেজ বা অন্য বটের মেসেজ ফরওয়ার্ড করুন।');
});

// নম্বর ডিটেক্ট ও 1-Tap Copyable Text ফরম্যাট জেনারেট করা
bot.on('text', async (ctx) => {
  const text = ctx.message.text;

  // ৮ থেকে ১৫ ডিজিটের ফোন নম্বর (প্লাস চিহ্ন সহ বা ছাড়া) খুঁজে বের করা
  const rawNumbers = text.match(/\+?\d{8,15}/g);

  if (!rawNumbers || rawNumbers.length === 0) {
    return ctx.reply('কোনো ফোন নম্বর পাওয়া যায়নি।');
  }

  // Duplicate নম্বর ফিল্টার করে '+' বাদ দেওয়া
  const cleanNumbers = [...new Set(rawNumbers.map((num) => num.replace(/^\+/, '')))];

  // চাওয়া ফরম্যাট অনুযায়ী আউটপুট তৈরি
  let responseText = '⚡ *কপি করতে নাম্বারের উপর চাপ দিন:*\n\n';
  cleanNumbers.forEach((num, index) => {
    // ফরম্যাট: Serial. `Number` 🟢
    responseText += `${index + 1}\\. \`${num}\` 🟢\n`;
  });

  // MarkdownV2 দিয়ে রেসপন্স পাঠানো
  await ctx.replyWithMarkdownV2(responseText);
});

// বট স্টার্ট
bot.launch();
console.log('Instant Copy Bot with Green Dot is running!');

// সেফ শাটডাউন
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
