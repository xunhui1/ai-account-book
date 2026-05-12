const { withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin: 自动记账灵动岛
 * 
 * 在 prebuild 时自动注入：
 * 1. PaymentNotificationListener.kt
 * 2. FloatingIslandService.kt
 * 3. PaymentListenerModule.kt
 * 4. PaymentListenerPackage.kt
 * 5. AndroidManifest.xml 权限和服务声明
 * 6. MainApplication.kt 中注册 Package
 */

function withAutoRecordNativeFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const javaDir = path.join(
        projectRoot,
        'android/app/src/main/java/com/aiaccountbook/app'
      );

      // 确保目录存在
      fs.mkdirSync(javaDir, { recursive: true });

      // 源文件目录
      const pluginSrcDir = path.join(projectRoot, 'plugins/auto-record/native');

      // 复制所有 .kt 文件
      const files = [
        'PaymentNotificationListener.kt',
        'FloatingIslandService.kt',
        'PaymentListenerModule.kt',
        'PaymentListenerPackage.kt',
      ];

      for (const file of files) {
        const src = path.join(pluginSrcDir, file);
        const dest = path.join(javaDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`[auto-record] Copied ${file}`);
        }
      }

      // 修改 MainApplication.kt 注册 PaymentListenerPackage
      const mainAppPath = path.join(javaDir, 'MainApplication.kt');
      if (fs.existsSync(mainAppPath)) {
        let content = fs.readFileSync(mainAppPath, 'utf8');
        if (!content.includes('PaymentListenerPackage')) {
          content = content.replace(
            'PackageList(this).packages.apply {',
            'PackageList(this).packages.apply {\n          add(PaymentListenerPackage())'
          );
          fs.writeFileSync(mainAppPath, content);
          console.log('[auto-record] Registered PaymentListenerPackage in MainApplication');
        }
      }

      return config;
    },
  ]);
}

function withAutoRecordManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const mainApplication = manifest.manifest.application[0];

    // 添加 FOREGROUND_SERVICE 权限
    const permissions = manifest.manifest['uses-permission'] || [];
    const hasForeground = permissions.some(
      (p) => p.$['android:name'] === 'android.permission.FOREGROUND_SERVICE'
    );
    if (!hasForeground) {
      permissions.push({ $: { 'android:name': 'android.permission.FOREGROUND_SERVICE' } });
    }
    manifest.manifest['uses-permission'] = permissions;

    // 添加 NotificationListenerService
    const services = mainApplication.service || [];
    const hasListener = services.some(
      (s) => s.$['android:name'] === '.PaymentNotificationListener'
    );
    if (!hasListener) {
      services.push({
        $: {
          'android:name': '.PaymentNotificationListener',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.service.notification.NotificationListenerService' } }],
          },
        ],
      });
    }

    // 添加 FloatingIslandService
    const hasFloating = services.some(
      (s) => s.$['android:name'] === '.FloatingIslandService'
    );
    if (!hasFloating) {
      services.push({
        $: {
          'android:name': '.FloatingIslandService',
          'android:exported': 'false',
        },
      });
    }

    mainApplication.service = services;
    return config;
  });
}

function withAutoRecord(config) {
  config = withAutoRecordNativeFiles(config);
  config = withAutoRecordManifest(config);
  return config;
}

module.exports = withAutoRecord;
