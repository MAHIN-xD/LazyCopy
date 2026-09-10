const { Telegraf, Markup } = require('telegraf');
const express = require('express');

// ১. Render-এর জন্য Express Web Server (২৪/৭ অনলাইন রাখতে)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Instant Copy Bot is running 24/7!');
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// ২. টেলিগ্রাম বট কনফিগারেশন
const BOT_TOKEN = '8928009450:AAF1kacThOZUMgnD9yBHSlcUvA1yINLBpGA';
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('বট অ্যাক্টিভ আছে! যেকোনো মেসেজ বা অন্য বটের মেসেজ ফরওয়ার্ড করুন।');
});

// মেসেজ থেকে ফোন নম্বর বের করা এবং Instant Copy Button তৈরি করা
bot.on('text', async (ctx) => {
  const text = ctx.message.text;

  // ৮ থেকে ১৫ ডিজিটের ফোন নম্বর (প্লাস চিহ্ন সহ বা ছাড়া) বের করা
  const rawNumbers = text.match(/\+?\d{8,15}/g);

  if (!rawNumbers || rawNumbers.length === 0) {
    return ctx.reply('কোনো ফোন নম্বর পাওয়া যায়নি।');
  }

  const buttons = rawNumbers.map((num) => {
    // '+' চিহ্ন পুরোপুরি মুছে ফেলা
    const cleanNum = num.replace(/^\+/, '');

    // 'copy_text' অবজেক্ট ব্যবহারে অ্যাপ সরাসরি ক্লিপবোর্ডে কপি করে নেয় (০ ডিলে)
    return [
      Markup.button.url(
        `📋 ${cleanNum}`, 
        `https://t.me/` // ফলব্যাক
      )
    ];
  });

  // সরাসরি টেলিগ্রাম বট API-এর 'copy_text' কিবোর্ড তৈরি
  const nativeCopyButtons = rawNumbers.map((num) => {
    const cleanNum = num.replace(/^\+/, '');
    return [
      {
        text: `📋 ${cleanNum}`,
        copy_text: { text: cleanNum } // টেলিগ্রামের নেটিভ অটো-কপি ফিচার
      }
    ];
  });

  await ctx.reply('কপি করতে নিচের বাটনে চাপ দিন:', {
    reply_markup: {
      inline_keyboard: nativeCopyButtons
    }
  });
});

bot.launch();
console.log('Instant Copy Bot started successfully!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
