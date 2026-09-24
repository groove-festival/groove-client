// 같은 문구로 다시 띄워도 표시 시간이 새로 시작되도록 id를 바꾼다.
export interface ToastState {
  id: number;
  message: string;
}

export const createToast = (message: string): ToastState => ({
  id: Date.now(),
  message,
});
