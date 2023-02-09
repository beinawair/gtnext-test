export type SendMessageRequest = {
  content: string;
  to?: {
    id: string | number;
    name?: string;
    username?: string;
  };
}
