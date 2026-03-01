let _toastCallback: ((msg: { type: string; content: string }) => void) | null =
  null;

export const registerToastCallback = (
  cb: (msg: { type: string; content: string }) => void,
) => {
  _toastCallback = cb;
};

const notify = (type: string, content: string) => {
  if (_toastCallback) {
    _toastCallback({ type, content });
  } else {
    if (type === "error") console.error(content);
    else console.log(content);
  }
};

export const useMessage = () => ({
  success: (content: string | { content: string; key?: string }) =>
    notify("success", typeof content === "string" ? content : content.content),
  error: (content: string | { content: string; key?: string }) =>
    notify("error", typeof content === "string" ? content : content.content),
  info: (content: string | { content: string; key?: string }) =>
    notify("info", typeof content === "string" ? content : content.content),
  warning: (content: string | { content: string; key?: string }) =>
    notify("warning", typeof content === "string" ? content : content.content),
});
