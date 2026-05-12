import { Platform, Linking } from 'react-native';

/**
 * 版本更新检查工具
 * 
 * 原理：
 * 1. 从 Expo Updates API 获取最新的构建版本信息
 * 2. 比较当前版本号与最新版本号
 * 3. 如果有更新，返回下载链接
 * 
 * 更新源：EAS Build 的 distribution page
 */

// 当前 APP 版本
export const APP_VERSION = '1.1.0';

// EAS 项目配置
const EAS_PROJECT_ID = '95efb99f-4fea-4fd7-98f7-d1d56e0b31d5';
const EAS_ACCOUNT = 'xun2hui';
const EAS_PROJECT_SLUG = 'ai-account-book';

// 更新检查 API（使用 Expo 的公开 API）
const UPDATE_CHECK_URL = `https://expo.dev/accounts/${EAS_ACCOUNT}/projects/${EAS_PROJECT_SLUG}/builds?platform=ANDROID&status=FINISHED&distribution=INTERNAL`;

// 备选方案：自定义更新服务器（可自行搭建）
const CUSTOM_UPDATE_URL = 'https://raw.githubusercontent.com/your-repo/ai-account-book/main/update.json';

export interface UpdateInfo {
  hasUpdate: boolean;
  version?: string;
  url?: string;
  changelog?: string;
  buildId?: string;
}

/**
 * 比较版本号
 * @returns 1 if a > b, -1 if a < b, 0 if equal
 */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  const len = Math.max(pa.length, pb.length);
  
  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

/**
 * 检查是否有新版本
 * 
 * 策略：
 * 1. 优先尝试自定义更新服务器（update.json）
 * 2. 回退到 EAS 构建页面
 */
export async function checkForUpdate(): Promise<UpdateInfo> {
  try {
    // 尝试自定义更新源
    const response = await fetch(CUSTOM_UPDATE_URL, { 
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (response.ok) {
      const data = await response.json();
      /**
       * update.json 格式：
       * {
       *   "version": "1.2.0",
       *   "url": "https://expo.dev/artifacts/eas/xxx.apk",
       *   "changelog": "新增XX功能，修复XX问题",
       *   "minVersion": "1.0.0"
       * }
       */
      if (data.version && compareVersions(data.version, APP_VERSION) > 0) {
        return {
          hasUpdate: true,
          version: data.version,
          url: data.url || getEASBuildPageUrl(),
          changelog: data.changelog,
        };
      }
    }
  } catch {
    // 自定义源不可用，使用 EAS 页面作为兜底
  }

  // 兜底：返回 EAS 构建页面链接
  // 在没有自定义服务器时，用户可以手动去 EAS 页面查看最新版本
  return {
    hasUpdate: false,
    version: APP_VERSION,
    url: getEASBuildPageUrl(),
  };
}

/**
 * 获取 EAS 构建页面 URL
 */
function getEASBuildPageUrl(): string {
  return `https://expo.dev/accounts/${EAS_ACCOUNT}/projects/${EAS_PROJECT_SLUG}/builds`;
}

/**
 * 打开更新页面
 */
export function openUpdatePage(url?: string) {
  const targetUrl = url || getEASBuildPageUrl();
  Linking.openURL(targetUrl).catch(() => {
    // 打开失败时尝试备用链接
    Linking.openURL(getEASBuildPageUrl());
  });
}
