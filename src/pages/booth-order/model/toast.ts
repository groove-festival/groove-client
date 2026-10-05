export interface ToastState {
  id: number;
  message: string;
}

export const createToast = (message: string): ToastState => ({
  id: Date.now(),
  message,
});
