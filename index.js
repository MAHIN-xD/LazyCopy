const { Telegraf, Markup } = require('telegraf');
const express = require('express');

// ১. Render Web Server (Sleep Mode ঠেকানোর জন্য)
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

// ইউজারদের মোড ট্র্যাক রাখা (Default: V1)
const userModes = {};

// নম্বরকে Unicode Bold-এ রূপান্তর করার হেলপার ফাংশন
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
    "⚙️ *মোড পরিবর্তন করতে:*\n" +
    "• /v1 - Instant Copy Text (🟢 1-Tap Copy)\n" +
    "• /v2 - Callback Mode (ট্যাপ করলে ✅ চিহ্ন হবে & Alert দেবে)\n\n" +
    "যেকোনো নম্বরযুক্ত মেসেজ ফরওয়ার্ড করুন।"
  );
});

// /v1 কমান্ড: Instant Copy Mode
bot.command('v1', (ctx) => {
  const userId = ctx.from.id;
  userModes[userId] = 'v1';
  ctx.reply('✅ Mode switched to V1: Instant Copy (🟢 Button)');
});

// /v2 কমান্ড: Callback & Click Check Mode
bot.command('v2', (ctx) => {
  const userId = ctx.from.id;
  userModes[userId] = 'v2';
  ctx.reply('✅ Mode switched to V2: Callback Tracking Mode (📋 -> ✅ Checkmark)');
});

// মেসেজ থেকে নম্বর ফিল্টার ও মোড অনুযায়ী বাটন তৈরি
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const currentMode = userModes[userId] || 'v1';
  const text = ctx.message.text;

  // ৮ থেকে ১৫ ডিজিটের ফোন নম্বর খুঁজে বের করা
  const rawNumbers = text.match(/\+?\d{8,15}/g);

  if (!rawNumbers || rawNumbers.length === 0) {
    return ctx.reply('কোনো ফোন নম্বর পাওয়া যায়নি।');
  }

  // Duplicate নম্বর বাদ দিয়ে '+' রিমুভ করা
  const cleanNumbers = [...new Set(rawNumbers.map((num) => num.replace(/^\+/, '')))];

  let buttons = [];

  if (currentMode === 'v2') {
    // V2: Callback Button (ট্যাপ করলে সার্ভারে রিকোয়েস্ট আসবে এবং ✅ হবে)
    buttons = cleanNumbers.map((num, index) => {
      const boldNum = toBoldDigits(num);
      return [
        Markup.button.callback(`📋 ${index + 1}. ${boldNum}`, `v2_copied_${num}_${index + 1}`)
      ];
    });
  } else {
    // V1: Instant Copy Text
    buttons = cleanNumbers.map((num, index) => {
      const boldNum = toBoldDigits(num);
      return [
        {
          text: `${index + 1}. ${boldNum} 🟢`,
          copy_text: { text: num }
        }
      ];
    });
  }

  await ctx.reply('কপি করতে নিচের বাটনে চাপ দিন:', Markup.inlineKeyboard(buttons));
});

// V2 Mode-এর বাটনে চাপ দিলে Callback হ্যান্ডেল করা
bot.action(/^v2_copied_(.+)_(.+)$/, async (ctx) => {
  const cleanNum = ctx.match[1];
  const serial = ctx.match[2];
  const boldNum = toBoldDigits(cleanNum);

  // ১. ক্লিক করা বাটনটি আপডেট করে '✅' করে দেওয়া
  const currentKeyboard = ctx.callbackQuery.message.reply_markup.inline_keyboard;

  const updatedKeyboard = currentKeyboard.map((row) => {
    return row.map((btn) => {
      if (btn.callback_data === `v2_copied_${cleanNum}_${serial}`) {
        return Markup.button.callback(`✅ ${serial}. ${boldNum}`, `v2_copied_${cleanNum}_${serial}`);
      }
      return btn;
    });
  });

  // UI সাথে সাথে আপডেট করা
  await ctx.editMessageReplyMarkup({ inline_keyboard: updatedKeyboard }).catch(() => {});

  // ২. পপআপ অ্যালার্ট দেওয়া
  await ctx.answerCbQuery(`ক্লিক করা হয়েছে: ${cleanNum}`, { show_alert: false });
});

// বট স্টার্ট
bot.launch().then(() => {
  console.log('Bot running successfully in V1 and V2 modes!');
}).catch((err) => {
  console.error('Error starting bot:', err);
});

// সেফ শাটডাউন
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
