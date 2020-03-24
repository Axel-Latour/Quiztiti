const Telegraf = require('telegraf');
const express = require('express');
const axios = require('axios');

const bot = new Telegraf("1132298501:AAHW-k5TMwYISexLi3DyN0YTHBzDwxd3oW8");
const app = express();

app.use(bot.webhookCallback('/checkAnswer'));
bot.telegram.setWebhook('http://adi3000.com:33333/checkAnswer');

bot.on('text', ctx => {
  return ctx.reply(ctx.message.text);
});

const generateQuestionsUrl = (req) => {
  return `https://opentdb.com/api.php?amount=10`;
};

app.post('/checkAnswer', (req, res) => {
  console.log(req.body);
});

app.get('/questions', (req, res) => {
  axios({
    method: 'get',
    url: generateQuestionsUrl(req)
  }).then(({ data: { results } }) => {
    res.send(results);
    console.log(results);
  });
});

app.listen(33333, () => {
  console.log('Quiztiti is running !');
});
