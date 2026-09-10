const { Telegraf, Markup } = require('telegraf');
const express = require('express');

// ১. Render-কে ২৪/৭ জাগিয়ে রাখার জন্য Express Web Server
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

// নম্বরকে Unicode Bold এ রূপান্তর করার ফাংশন
function toBoldDigits(numStr) {
  const boldMap = {
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
    '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟡'
  };
  return numStr.split('').map(ch => boldMap[ch] || ch).join('');
}

// /start কমান্ড
bot.start((ctx) => {
  ctx.reply('বট অ্যাক্টিভ আছে! যেকোনো মেসেজ বা অন্য বটের নম্বরযুক্ত মেসেজ ফরওয়ার্ড করুন।');
});

// নম্বর ডিটেক্ট ও Fast Copy Button জেনারেট করা
bot.on('text', async (ctx) => {
  const text = ctx.message.text;

  // ৮ থেকে ১৫ ডিজিটের ফোন নম্বর (প্লাস চিহ্ন সহ বা ছাড়া) খুঁজে বের করা
  const rawNumbers = text.match(/\+?\d{8,15}/g);

  if (!rawNumbers || rawNumbers.length === 0) {
    return ctx.reply('কোনো ফোন নম্বর পাওয়া যায়নি।');
  }

  // Duplicate নম্বর ফিল্টার করে '+' চিহ্ন বাদ দেওয়া
  const cleanNumbers = [...new Set(rawNumbers.map((num) => num.replace(/^\+/, '')))];

  // টেলিগ্রামের নেটিভ copy_text বাটন স্ট্রাকচার
  const buttons = cleanNumbers.map((num, index) => {
    const boldNum = toBoldDigits(num);
    const buttonText = `${index + 1}. ${boldNum} 🟢`;

    return [
      {
        text: buttonText,
        copy_text: { text: num }
      }
    ];
  });

  await ctx.reply('কপি করতে নিচের বাটনে চাপ দিন:', Markup.inlineKeyboard(buttons));
});

// বট স্টার্ট
bot.launch();
console.log('Ultra Fast Button Copy Bot is running successfully!');

// সেফ শাটডাউন
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
