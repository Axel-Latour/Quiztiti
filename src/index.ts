const Telegraf = require('telegraf');
const express = require('express')();

const bot = new Telegraf("1132298501:AAHW-k5TMwYISexLi3DyN0YTHBzDwxd3oW8");

bot.on('text', ctx => {
  return ctx.reply(ctx.message.text);
});

express.listen(3000, () => {
  console.log('Quiztiti is running !');
});
