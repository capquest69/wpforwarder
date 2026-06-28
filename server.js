require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_ID;

const LISTA = ['59171788088','59174574374'];
const CHAT_ESPECIFICO = '59171788088';
const PALABRA_CLAVE = 'alerta';

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('mgs test ok');
    return res.send(req.query['hub.challenge']);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (msg && msg.type === 'text') {
    const de = msg.from;
    const texto = msg.text.body;
    const esElChat = de === CHAT_ESPECIFICO || texto.toLowerCase().includes(PALABRA_CLAVE);

    if (esElChat) {
      for (const destino of LISTA) {
        await axios.post(
          `https://graph.facebook.com/v25.0/${PHONE_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            to: destino,
            type: 'text',
            text: { body: `Reenviado de ${de}: ${texto}` }
          },
          { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
        );
      }
    }
    console.log('receibe msg');
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot listo en puerto', PORT));