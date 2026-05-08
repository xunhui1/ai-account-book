import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// AI 记账助手 - 调用 MiMo API 进行自然语言解析
const MIMO_API_URL = 'https://api.xiaomimimo.com/v1/chat/completions';
const MIMO_API_KEY = 'YOUR_MIMO_API_KEY'; // 替换为你的 MiMo API Key

const SYSTEM_PROMPT = `你是一个智能记账助手。用户会用自然语言告诉你消费或收入信息，你需要：
1. 解析出金额、分类、备注
2. 返回 JSON 格式：{"amount": 数字, "type": "expense"或"income", "category": "分类名", "note": "备注"}
3. 如果信息不完整，友好地追问
4. 也可以回答关于理财、消费习惯的问题

可用的支出分类：餐饮、交通、购物、娱乐、住房、医疗、教育、日用、社交、其他
可用的收入分类：工资、奖金、投资、兼职、红包、其他`;

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: '你好！我是你的 AI 记账助手 🤖\n\n你可以直接说：\n• "午饭花了32"\n• "打车15块"\n• "发工资了8000"\n\n我会帮你自动分类记录！' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(MIMO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MIMO_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'MiMo-V2.5-Reasoning',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input.trim() },
          ],
        }),
      });

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回复';

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '网络请求失败，请检查网络连接和 API 配置',
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.role === 'user' && styles.msgRowUser]}>
      <View style={[styles.msgBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.msgText, item.role === 'user' && styles.userText]}>
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={{ paddingVertical: 12 }}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingText}>AI 正在思考...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="说点什么...如：午饭32元"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>发送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messageList: { flex: 1 },
  msgRow: { paddingHorizontal: 12, marginVertical: 4, flexDirection: 'row' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: '#4CAF50', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22, color: '#333' },
  userText: { color: '#fff' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'center' },
  loadingText: { marginLeft: 8, color: '#999', fontSize: 13 },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginLeft: 8,
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontWeight: 'bold' },
});
