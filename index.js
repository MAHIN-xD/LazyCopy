const { Telegraf, Markup } = require('telegraf');
const express = require('express');

// ১. Render-কে ২৪/৭ চালু রাখার জন্য Express Web Server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running ultra fast 24/7!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server listening on port ${PORT}`);
});

// ২. টেলিগ্রাম বট কনফিগারেশন
const BOT_TOKEN = '8928009450:AAF1kacThOZUMgnD9yBHSlcUvA1yINLBpGA';
const bot = new Telegraf(BOT_TOKEN);

// মোড ট্র্যাক করার জন্য অবজেক্ট (Default: V1 - Ultra Fast Copy)
const userModes = {};

// নম্বরকে Unicode Bold-এ রূপান্তর করার ফাংশন
function toBoldDigits(numStr) {
  const boldMap = {
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
    '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟡'
  };
  return numStr.split('').map(ch => boldMap[ch] || ch).join('');
}

// /start কমান্ড
bot.start((ctx) => {
  ctx.reply(
    "বট অ্যাক্টিভ আছে!\n\n" +
    "⚙️ মোড পরিবর্তন করতে:\n" +
    "• /v1 - Instant Copy & Green Dot (Default)\n" +
    "• /v2 - Switch Inline Query Mode (Python style)\n\n" +
    "যেকোনো নম্বরযুক্ত মেসেজ পাঠালে বা ফরওয়ার্ড করলে বাটন তৈরি হয়ে যাবে।"
  );
});

// /v1 কমান্ড: Fast Copy Mode সেট করা
bot.command('v1', (ctx) => {
  const userId = ctx.from.id;
  userModes[userId] = 'v1';
  ctx.reply('✅ Mode switched to V1: Instant Copy Text with Green Dot 🟢');
});

// /v2 কমান্ড: Python Switch Inline Query Mode সেট করা
bot.command('v2', (ctx) => {
  const userId = ctx.from.id;
  userModes[userId] = 'v2';
  ctx.reply('✅ Mode switched to V2: Switch Inline Query (Python Script Style) 🔄');
});

// মেসেজ থেকে নম্বর ফিল্টার ও মোড অনুযায়ী বাটন পাঠানো
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const currentMode = userModes[userId] || 'v1';
  const text = ctx.message.text;

  // ৮ থেকে ১৫ ডিজিটের ফোন নম্বর খুঁজে বের করা
  const rawNumbers = text.match(/\+?\d{8,15}/g);

  if (!rawNumbers || rawNumbers.length === 0) {
    return ctx.reply('কোনো ফোন নম্বর পাওয়া যায়নি।');
  }

  // Duplicate নম্বর ফিল্টার করে '+' বাদ দেওয়া
  const cleanNumbers = [...new Set(rawNumbers.map((num) => num.replace(/^\+/, '')))];

  let buttons = [];

  if (currentMode === 'v2') {
    // V2: Python scripts-এর মতো switch_inline_query_current_chat স্টাইল
    buttons = cleanNumbers.map((num) => [
      Markup.button.switchToCurrentChat(num, num)
    ]);
  } else {
    // V1: 1-Tap Copy Text & Green Dot স্টাইল
    buttons = cleanNumbers.map((num, index) => {
      const boldNum = toBoldDigits(num);
      const buttonText = `${index + 1}. ${boldNum} 🟢`;
      return [
        {
          text: buttonText,
          copy_text: { text: num }
        }
      ];
    });
  }

  await ctx.reply('কপি করতে নিচের বাটনে চাপ দিন:', Markup.inlineKeyboard(buttons));
});

// বট চালু করা
bot.launch().then(() => {
  console.log('Telegram Bot running with V1 and V2 modes!');
}).catch((err) => {
  console.error('Error starting bot:', err);
});

// সেফ শাটডাউন
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
