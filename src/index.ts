const Telegraf = require('telegraf');
const express = require('express');
const axios = require('axios');

const bot = new Telegraf("1132298501:AAHW-k5TMwYISexLi3DyN0YTHBzDwxd3oW8");
const app = express();

// app.use(bot.webhookCallback('/checkAnswer'));
// bot.telegram.setWebhook('http://adi3000.com:33333/checkAnswer');

bot.on('text', ctx => {
  return ctx.reply(ctx.message.text);
});

app.post('/message', (req, res) => {
  console.log(req.body);
});

app.get('/questions', (req, res) => {
  const generateQuestionsUrl = (req) => {
    return `https://opentdb.com/api.php?amount=10`;
  };

  axios({
    method: 'get',
    url: generateQuestionsUrl(req)
  }).then(({ data: { results } }) => {
    res.send(results);
    console.log(results);
  }, error => console.log(error));
});

app.listen(33333, () => {
  console.log('Quiztiti is running !');
});

bot.startPolling();