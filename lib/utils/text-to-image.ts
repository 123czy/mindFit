/**
 * 将文本内容转换为图片的工具函数
 * 用于长文类型的内容预览
 */

interface TextToImageOptions {
  title: string;
  body: string;
  coverImageUrl: string;
  type: "cover1" | "cover2" | "cover3" | "cover4";
}

/**
 * 创建一个包含文本内容和水印的图片
 */
export async function createTextImage({
  title,
  body,
  coverImageUrl,
  type,
}: TextToImageOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    // 创建画布
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("无法创建画布"));
      return;
    }

    // 创建背景图片
    const backgroundImage = new Image();
    backgroundImage.crossOrigin = "anonymous";

    backgroundImage.onload = () => {
      // 绘制背景图片（带模糊效果）
      ctx.filter = "blur(0px)";
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      // 绘制半透明遮罩
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制标题
      ctx.fillStyle = type === "cover3" ? "#fff" : "#333";
      ctx.font = 'bold 60px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = type === "cover3" ? "center" : "left";
      ctx.textBaseline = type === "cover3" ? "middle" : "top";

      const titleY = type === "cover3" ? 700 : 400;
      const titleMaxWidth = type === "cover3" ? 600 : 1000;
      const titleLines = wrapText(ctx, title, titleMaxWidth);
      const titleLinesLength = type === "cover3" ? canvas.width / 2 : 40;

      titleLines.forEach((line, index) => {
        ctx.fillText(line, titleLinesLength, titleY + index * 72);
      });

      // 绘制正文内容
      ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif';
      const bodyY = titleY + titleLines.length * 40 + 80;
      const bodyMaxWidth = 1000;
      body = type === "cover3" ? " " : body;
      const bodyLines = wrapText(ctx, body, bodyMaxWidth);

      // 计算需要显示的行数（最多20行）
      const maxLines = 20;
      const linesToShow = bodyLines.slice(0, maxLines);

      linesToShow.forEach((line, index) => {
        ctx.fillText(line, 40, bodyY + index * 32);
      });

      // 如果内容过长，添加省略号
      if (bodyLines.length > maxLines) {
        ctx.fillText("...", 40, bodyY + maxLines * 32);
      }

      // 转换为base64
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    };

    backgroundImage.onerror = () => {
      reject(new Error("无法加载封面图片"));
    };

    // 加载封面图片
    backgroundImage.src = coverImageUrl;
  });
}

/**
 * 文本换行工具
 * 支持原有的换行符和自动换行
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];

  // 先按照换行符分割文本
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      // 空行保留
      lines.push("");
      continue;
    }

    let currentLine = "";
    for (let i = 0; i < paragraph.length; i++) {
      const char = paragraph[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : [text];
}
