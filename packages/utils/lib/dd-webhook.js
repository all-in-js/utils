var C = require('crypto');
const fetch = require('node-fetch');
const log = require('./log');

class DDWebhook {
  constructor({
    secret,
    webhook
  } = {}) {
    if (!secret || !webhook) {
      log.error('secret or webhook excepted!');
      process.exit(1);
    }
    this.secret = secret;
    this.webhook = webhook;
    this.timestamp = Date.now();
  }
  createSignature() {
    const stringToSign = `${this.timestamp}\n${this.secret}`;
    const hmac = C.createHmac('sha256', this.secret);
    hmac.update(stringToSign, 'utf8');
    const sign = encodeURIComponent(hmac.digest('base64'));
    return sign;
  }
  sendMessage(body) {
    const openapi = `${this.webhook}&sign=${this.createSignature()}&timestamp=${this.timestamp}`;
    return fetch(openapi, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json());
  }
}

module.exports = DDWebhook;

// const secret = 'SEC...';
// const webhook = 'webhook...';
// new DDWebhook({
//   secret,
//   webhook
// }).sendMessage({
//   msgtype: "text", 
//   text: {
//     content: '测试用'
//   }
// })
// .then(console.log)
// .catch(console.log);