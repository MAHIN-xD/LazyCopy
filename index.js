const { Telegraf, Markup } = require('telegraf');
const express = require('express');

// ১. Express Web Server (Render Sleep Mode ঠেকানোর জন্য)
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

// নম্বর ডিটেক্ট ও বাটন জেনারেট করা
bot.on('text', async (ctx) => {
  const text = ctx.message.text;

  // ৮ থেকে ১৫ ডিজিটের ফোন নম্বর (প্লাস চিহ্ন সহ বা ছাড়া) খুঁজে বের করা
  const rawNumbers = text.match(/\+?\d{8,15}/g);

  if (!rawNumbers || rawNumbers.length === 0) {
    return ctx.reply('কোনো ফোন নম্বর পাওয়া যায়নি।');
  }

  const buttons = rawNumbers.map((num) => {
    // '+' চিহ্ন তুলে ফেলা
    const cleanNum = num.replace(/^\+/, '');

    // ইনলাইন বাটন তৈরি
    return [
      Markup.button.callback(
        `📋 ${cleanNum}`, 
        `copied_${cleanNum}`
      )
    ];
  });

  await ctx.reply('কপি করতে নিচের বাটনে চাপ দিন:', Markup.inlineKeyboard(buttons));
});

// বাটনে ক্লিক করলে ক্লিকড চিহ্নিত করা ও অতি দ্রুত রেসপন্স
bot.action(/^copied_(.+)$/, async (ctx) => {
  const cleanNum = ctx.match[1];

  // বাটন পরিবর্তন করে '✅' যোগ করা যাতে বোঝা যায় অলরেডি চাপ দেওয়া হয়েছে
  const currentKeyboard = ctx.callbackQuery.message.reply_markup.inline_keyboard;
  
  const updatedKeyboard = currentKeyboard.map((row) => {
    return row.map((btn) => {
      if (btn.callback_data === `copied_${cleanNum}`) {
        return Markup.button.callback(`✅ ${cleanNum}`, `copied_${cleanNum}`);
      }
      return btn;
    });
  });

  // UI আপডেট
  await ctx.editMessageReplyMarkup({ inline_keyboard: updatedKeyboard }).catch(() => {});

  // কুইক অ্যালার্ট পপআপ
  await ctx.answerCbQuery(`কপি করা হয়েছে: ${cleanNum}`, { show_alert: false });
});

// বট স্টার্ট
bot.launch();
console.log('Bot successfully started on Render!');

// সেফ শাটডাউন
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
