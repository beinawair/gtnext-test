export class SendNotifRequest {
  constructor(
    public title?: string,
    public formatId?: string,
    public data?: Record<string, unknown>,
    public template?: string,
    public customMessage?: string,
  ) {}
}
