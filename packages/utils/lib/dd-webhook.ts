import C from 'crypto';
import fetch from 'node-fetch';
import log from './log';

interface Option {
  secret: string;
  webhook: string;
}

/**
 * 基础消息类型
 */
interface MsgType {
  msgtype: string;
}

type At = {
  atMobiles: string[];
  isAtAll: boolean;
}

/**
 * text类型
 */
type TextContent = {
  content: string;
}
interface TextType extends MsgType {
  text: TextContent, 
  at: At 
}

/**
 * link类型
 */
type LinkObj = {
  text: string; 
  title: string; 
  messageUrl: string;
  picUrl?: string;
}
interface LinkType extends MsgType {
  link: LinkObj
}

/**
 * markdown类型
 */
type Markdown = {
  title: string;
  text: string;
}
interface MarkdownType extends MsgType {
  markdown: Markdown;
  at: At;
}

export type DDMessageType = TextType | LinkType | MarkdownType;

export default class DDWebhook {
  public secret: string;
  public webhook: string;
  public timestamp: number;
  constructor(option: Option) {
    const {
      secret,
      webhook
    } = option;
    if (!secret || !webhook) {
      log.error('secret or webhook excepted!');
      process.exit(1);
    }
    this.secret = secret;
    this.webhook = webhook;
    this.timestamp = Date.now();
  }
  createSignature(): string {
    const stringToSign = `${this.timestamp}\n${this.secret}`;
    const hmac: C.Hmac = C.createHmac('sha256', this.secret);
    hmac.update(stringToSign, 'utf8');
    const sign: string = encodeURIComponent(hmac.digest('base64'));
    return sign;
  }
  sendMessage(body: DDMessageType) {
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