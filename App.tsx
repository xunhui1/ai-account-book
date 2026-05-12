import React, { useEffect, useState } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import AIScreen from './src/screens/AIScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import QuickAddScreen from './src/screens/QuickAddScreen';
import { registerNotifications, scheduleDailyReminder } from './src/utils/notifications';
import { useAutoRecord } from './src/hooks/useAutoRecord';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Deep Linking 配置 - 支持从快捷方式/Widget 打开特定页面
const linking: LinkingOptions<any> = {
  prefixes: ['aiaccountbook://', 'https://aiaccountbook.app'],
  config: {
    screens: {
      Main: {
        screens: {
          '记账': 'home',
          '统计': 'stats',
          'AI助手': 'ai',
          '设置': 'settings',
        },
      },
      QuickAdd: 'quick-add/:type',
    },
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="记账"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text> }}
      />
      <Tab.Screen
        name="统计"
        component={StatsScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text> }}
      />
      <Tab.Screen
        name="AI助手"
        component={AIScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🤖</Text> }}
      />
      <Tab.Screen
        name="设置"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // 启用自动记账（监听支付通知 + 智能分类 + 写入数据库）
  useAutoRecord(true);

  useEffect(() => {
    // 初始化通知权限 & 设置每日记账提醒（默认晚上9点）
    registerNotifications().then(granted => {
      if (granted) {
        scheduleDailyReminder(21, 0);
      }
    });

    // 监听通知点击 - 跳转到快速记账
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const action = response.notification.request.content.data?.action;
      if (action === 'quick_add') {
        Linking.openURL('aiaccountbook://quick-add/expense');
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style="dark" />
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="QuickAdd"
          component={QuickAddScreen}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
