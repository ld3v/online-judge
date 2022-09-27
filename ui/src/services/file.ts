import { JSON2FormData } from "@/utils/funcs";
import request from "@/utils/request"

export const uploadMulti = (value: any[], key?: string) => {
  const formData = new FormData();
  JSON2FormData({ [key || 'test']: value }, undefined, formData);
  return request('/local-file/multi', {
    method: 'POST',
    data: formData,
  })
}