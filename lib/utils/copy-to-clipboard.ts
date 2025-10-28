/**
 * 复制文本到剪贴板
 * @param text - 要复制的文本
 * @returns Promise<boolean> - 复制是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    // 降级方案：使用旧版 API
    return fallbackCopyToClipboard(text);
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("复制失败:", err);
    // 尝试降级方案
    return fallbackCopyToClipboard(text);
  }
}

/**
 * 降级方案的复制方法
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    return successful;
  } catch (err) {
    console.error("降级复制失败:", err);
    return false;
  }
}

/**
 * 复制文本并在成功时显示提示（可选）
 * @param text - 要复制的文本
 * @param onSuccess - 成功回调
 * @param onError - 失败回调
 */
export async function copyWithNotification(
  text: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> {
  const success = await copyToClipboard(text);

  if (success && onSuccess) {
    onSuccess();
  } else if (!success && onError) {
    onError("复制失败，请手动复制");
  }
}
