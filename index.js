const request = require('request-promise');
const TeleBot = require('telebot');

const bot = new TeleBot({
  token: process.env.TOKEN,
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

bot.on('inlineQuery', (msg) => {
  const asyncFunc = async () => {
    let query = msg.query;
    const replacedCharacterQuery = query.replace(/’/gi, "'");
    console.log(`inline query: ${replacedCharacterQuery}`);

    // Create a new answer list object
    const answers = bot.answerList(msg.id, { cacheTime: 60 });

    await request(
      `https://www.playphrase.me/api/v1/phrases/search?q=${escape(
        replacedCharacterQuery
      )}&limit=10&skip=0`,
      { json: true },
      (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        body.phrases.forEach((phrase) => {
          answers.addVideo({
            id: phrase.id,
            title: phrase['video-info'].info,
            description: phrase.text,
            thumb_url: 'https://avatarfiles.alphacoders.com/967/96712.jpg',
            mime_type: 'video/mp4',
            video_url: phrase['video-url'],
          });
        });
      }
    );

    // Send answers
    return bot.answerQuery(answers);
  };

  asyncFunc();
});

bot.connect();
