/**
 * Instagram Story Template Generator
 * Creates 9:16 vertical images optimized for Instagram Stories
 */

/* eslint-disable no-restricted-syntax */
import html2canvas from "html2canvas";

import type { InstagramTemplateOptions } from "./types";

/**
 * Instagram Story dimensions (9:16 aspect ratio)
 */
export const INSTAGRAM_STORY_DIMENSIONS = {
  aspectRatio: 9 / 16,
  height: 1920,
  width: 1080,
};

/**
 * Download Instagram Story image
 */
export function downloadInstagramStory(
  dataUrl: string,
  fileName: string = "story.png",
): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate Instagram Story template HTML
 */
export function generateInstagramHTML(
  options: InstagramTemplateOptions,
): string {
  const {
    backgroundColor = "#FF6B35",
    resultDescription,
    resultEmoji,
    resultTitle,
    testName,
    userName = "Anonymous",
  } = options;

  return `
    <div style="
      width: ${INSTAGRAM_STORY_DIMENSIONS.width}px;
      height: ${INSTAGRAM_STORY_DIMENSIONS.height}px;
      background: linear-gradient(135deg, ${backgroundColor} 0%, ${adjustColor(backgroundColor, -20)} 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px 60px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
      overflow: hidden;
    ">
      <!-- Decorative circles -->
      <div style="
        position: absolute;
        top: -100px;
        right: -100px;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
      "></div>
      <div style="
        position: absolute;
        bottom: -150px;
        left: -150px;
        width: 500px;
        height: 500px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
      "></div>

      <!-- Header -->
      <div style="position: relative; z-index: 1;">
        <div style="
          color: rgba(255, 255, 255, 0.9);
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 16px;
        ">${testName}</div>
        <div style="
          width: 80px;
          height: 4px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 2px;
        "></div>
      </div>

      <!-- Main Content -->
      <div style="position: relative; z-index: 1; text-align: center;">
        <div style="
          font-size: 180px;
          margin-bottom: 40px;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
        ">${resultEmoji}</div>

        <div style="
          background: rgba(255, 255, 255, 0.95);
          border-radius: 32px;
          padding: 60px 50px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        ">
          <div style="
            font-size: 56px;
            font-weight: 800;
            color: ${backgroundColor};
            margin-bottom: 24px;
            line-height: 1.2;
          ">${resultTitle}</div>

          <div style="
            font-size: 36px;
            color: #333;
            line-height: 1.6;
            margin-bottom: 32px;
          ">${resultDescription}</div>

          <div style="
            display: inline-block;
            background: ${backgroundColor};
            color: white;
            padding: 20px 40px;
            border-radius: 50px;
            font-size: 32px;
            font-weight: 700;
          ">@${userName}</div>
        </div>
      </div>

      <!-- Footer CTA -->
      <div style="position: relative; z-index: 1; text-align: center;">
        <div style="
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          padding: 32px 48px;
        ">
          <div style="
            color: white;
            font-size: 40px;
            font-weight: 700;
            margin-bottom: 16px;
          ">나도 테스트하기 👆</div>
          <div style="
            color: rgba(255, 255, 255, 0.9);
            font-size: 28px;
          ">oiyo.app</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate Instagram Story image
 */
export async function generateInstagramStory(
  options: InstagramTemplateOptions,
): Promise<string> {
  try {
    // Create temporary container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.innerHTML = generateInstagramHTML(options);
    document.body.appendChild(container);

    // Generate image with html2canvas
    const canvas = await html2canvas(
      container.firstElementChild as HTMLElement,
      {
        height: INSTAGRAM_STORY_DIMENSIONS.height,
        logging: false,
        useCORS: true,

        width: INSTAGRAM_STORY_DIMENSIONS.width,
      },
    );

    // Cleanup
    document.body.removeChild(container);

    // Return data URL
    return canvas.toDataURL("image/png", 1.0);
  } catch (error) {
    console.error("Instagram Story generation failed:", error);
    throw new Error("Failed to generate Instagram Story");
  }
}

/**
 * Generate Instagram Story with QR code
 */
export async function generateInstagramStoryWithQR(
  options: InstagramTemplateOptions,
  qrCodeDataUrl: string,
): Promise<string> {
  try {
    const html = generateInstagramHTML(options);

    // Add QR code overlay
    const htmlWithQR = html.replace(
      "</div>",
      `
        <div style="
          position: absolute;
          bottom: 140px;
          right: 60px;
          width: 180px;
          height: 180px;
          background: white;
          border-radius: 20px;
          padding: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          z-index: 10;
        ">
          <img src="${qrCodeDataUrl}" style="width: 100%; height: 100%; border-radius: 12px;" />
        </div>
      </div>`,
    );

    // Create temporary container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.innerHTML = htmlWithQR;
    document.body.appendChild(container);

    // Generate image
    const canvas = await html2canvas(
      container.firstElementChild as HTMLElement,
      {
        height: INSTAGRAM_STORY_DIMENSIONS.height,
        logging: false,
        useCORS: true,

        width: INSTAGRAM_STORY_DIMENSIONS.width,
      },
    );

    // Cleanup
    document.body.removeChild(container);

    return canvas.toDataURL("image/png", 1.0);
  } catch (error) {
    console.error("Instagram Story with QR generation failed:", error);
    // Fallback to story without QR
    return generateInstagramStory(options);
  }
}

/**
 * Adjust color brightness
 */
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
