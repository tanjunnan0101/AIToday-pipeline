export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

export const consoleEmailProvider: EmailProvider = {
  async send(message) {
    console.log("Email hook", message.to, message.subject);
  },
};
