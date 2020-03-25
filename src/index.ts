const Telegraf = require('telegraf');
const { Markup } = Telegraf;
const axios = require('axios');

const bot = new Telegraf("1132298501:AAHW-k5TMwYISexLi3DyN0YTHBzDwxd3oW8");

const express = require('express');
const app = express();

app.listen(3000, () => {
  console.log(`I'm ready !`);
});

app.get('/test', (req, res) => {
})

let currentStatus;

bot.command('start', (ctx) => {
  currentStatus = GameStatus.CHOOSING_CATEGORY;
  return ctx.reply(
    `Quiztitiiiiiiiiii ! Starting a new game ! Please, choose your category.`,
    Markup.keyboard((constructCategoriesList())).oneTime().resize().extra()
  );
});

bot.on('text', (ctx) => {
  const message = ctx.message.text;
  if (currentStatus === GameStatus.CHOOSING_CATEGORY && playedCategories[message]) {
    return ctx.reply(`You choose ${playedCategories[message]} ! Good luck !`);
  }
});

bot.startPolling();