# AI 记账 - AI Account Book

基于 React Native + Expo 开发的智能记账 App，集成小米 MiMo 大模型实现 AI 辅助记账。

## 功能特性

- 📝 **快速记账** - 手动选择分类，输入金额即可完成记录
- 🤖 **AI 智能记账** - 自然语言输入，AI 自动解析金额和分类（如："午饭花了32"）
- 📊 **统计分析** - 月度收支概览、分类排行
- 💾 **本地存储** - SQLite 数据库，数据安全可靠

## 技术栈

- **框架**: React Native + Expo
- **语言**: TypeScript
- **数据库**: expo-sqlite
- **AI 模型**: Xiaomi MiMo V2.5
- **导航**: React Navigation

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务
npx expo start

# 安卓运行
npx expo start --android
```

## 项目结构

```
ai-account-book/
├── App.tsx                  # 应用入口 + 导航配置
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx   # 首页 - 今日记账
│   │   ├── StatsScreen.tsx  # 统计页面
│   │   ├── AIScreen.tsx     # AI 助手对话页
│   │   └── SettingsScreen.tsx # 设置页面
│   ├── components/
│   │   └── AddRecordModal.tsx # 添加记录弹窗
│   ├── database/
│   │   └── db.ts            # SQLite 数据库操作
│   ├── constants/
│   │   └── categories.ts   # 分类配置
│   └── types/
│       └── index.ts         # TypeScript 类型定义
├── package.json
├── app.json                 # Expo 配置
└── tsconfig.json
```

## AI 功能说明

本项目使用小米 MiMo API 实现智能记账功能：

1. **自然语言记账**: 用户输入 "奶茶15块"，AI 解析为 {金额: 15, 分类: 餐饮}
2. **消费分析**: AI 分析月度消费习惯，给出理财建议
3. **智能分类**: 自动识别消费类型并归类

### 配置 MiMo API

在 `src/screens/AIScreen.tsx` 中替换 API Key：

```typescript
const MIMO_API_KEY = 'YOUR_MIMO_API_KEY';
```

## License

MIT
