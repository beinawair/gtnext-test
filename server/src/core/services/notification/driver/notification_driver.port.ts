import type { NotificationDriverSetting } from "./models/notification_driver_setting"
import type { SendMessageRequest } from "./models/send_message_request"

export type NotificationDriverPort = {
  driver_type: string;
	
  connect(setting: NotificationDriverSetting): Promise<void>;
  send(request: SendMessageRequest): Promise<unknown>;
}
