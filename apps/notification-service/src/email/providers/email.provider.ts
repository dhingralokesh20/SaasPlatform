export interface EmailProvider {
  send(data: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: object[];
  }): Promise<{
    providerMessageId?: string;
  }>;
}