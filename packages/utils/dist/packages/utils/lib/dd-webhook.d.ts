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
declare type At = {
    atMobiles: string[];
    isAtAll: boolean;
};
/**
 * text类型
 */
declare type TextContent = {
    content: string;
};
interface TextType extends MsgType {
    text: TextContent;
    at: At;
}
/**
 * link类型
 */
declare type LinkObj = {
    text: string;
    title: string;
    messageUrl: string;
    picUrl?: string;
};
interface LinkType extends MsgType {
    link: LinkObj;
}
/**
 * markdown类型
 */
declare type Markdown = {
    title: string;
    text: string;
};
interface MarkdownType extends MsgType {
    markdown: Markdown;
    at: At;
}
export declare type DDMessageType = TextType | LinkType | MarkdownType;
export declare class DDWebhook {
    secret: string;
    webhook: string;
    timestamp: number;
    constructor(option: Option);
    createSignature(): string;
    sendMessage(body: DDMessageType): Promise<any>;
}
export default DDWebhook;
//# sourceMappingURL=dd-webhook.d.ts.map