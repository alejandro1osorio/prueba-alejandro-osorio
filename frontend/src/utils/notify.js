import { message } from "antd";

export function notifySuccess(text) {
  message.success(text);
}

export function notifyError(text) {
  message.error(text);
}
