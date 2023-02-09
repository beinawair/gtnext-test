export class BotResponse {
  constructor(
    public message_id: number,
    public chat: {
      id: number; type: string;
    },
    public from?: {
      id?: number; name?: string; username?: string; isBot?: boolean;
    },
    public text?: string,
    public replyTo?: Record<string, any>,
    public date?: Date | number,
  ) {}
}
