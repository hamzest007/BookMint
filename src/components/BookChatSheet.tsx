import React, { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing } from '../theme/tokens';
import { askBookAssistant, ChatMessage, ChatScope } from '../services/bookChat';
import { hasGeminiKey } from '../services/gemini';
import { socketService } from '../services/socket';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  chapterLabel: string;
  getContext: (scope: ChatScope, allowSpoilers: boolean) => string;
  onSaveResponse: (text: string) => void;
};

const quickQuestions = [
  'Summarize this chapter', 'Explain simply', 'Who are the characters?', 'Key events',
  'Why did this happen?', 'Important quotes', 'What did I learn?',
];

export const BookChatSheet: React.FC<Props> = ({ visible, onClose, title, description, chapterLabel, getContext, onSaveResponse }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState<ChatScope>('chapter');
  const [spoilerFree, setSpoilerFree] = useState(true);
  const [pendingSpoilerQuestion, setPendingSpoilerQuestion] = useState<string | null>(null);
  const [useSocket, setUseSocket] = useState(false);

  useEffect(() => {
    if (visible) {
      // Try to connect to socket for real-time chat
      try {
        socketService.connect();
        setUseSocket(socketService.isConnected());

        // Set up socket listeners
        socketService.onAIResponse((data) => {
          setMessages(current => [...current, {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: data.message,
            isSpoiler: !spoilerFree
          }]);
          setLoading(false);
        });

        socketService.onAIError((data) => {
          setMessages(current => [...current, {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: `Error: ${data.error}`
          }]);
          setLoading(false);
        });

        socketService.onAIThinking((data) => {
          setLoading(true);
        });

      } catch (error) {
        console.log('Socket connection failed, falling back to HTTP:', error);
        setUseSocket(false);
      }
    } else {
      // Disconnect when modal closes
      socketService.removeAllListeners();
      // Don't disconnect completely as other components might use it
    }
  }, [visible, spoilerFree]);

  const scopeOptions: { value: ChatScope; label: string }[] = [
    { value: 'chapter', label: 'Current Chapter' }, { value: 'previous', label: 'Previous Chapters' }, { value: 'book', label: 'Entire Book' },
  ];
  const lastAssistant = useMemo(() => [...messages].reverse().find(message => message.role === 'assistant'), [messages]);
  const usingOfflineAssistant = !useSocket && !hasGeminiKey();

  const isFutureQuestion = (question: string) => /\b(aage|next|future|later|spoiler|aagay)\b/i.test(question);
  const send = async (question = input, allowSpoilers = !spoilerFree) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;
    if (spoilerFree && !allowSpoilers && isFutureQuestion(cleanQuestion)) {
      setPendingSpoilerQuestion(cleanQuestion);
      return;
    }
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: cleanQuestion };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setLoading(true);

    // Try socket first if available
    if (useSocket) {
      try {
        const roomId = `book-${title.replace(/\s+/g, '-').toLowerCase()}`;
        socketService.joinRoom(roomId);
        socketService.sendAIMessage(roomId, cleanQuestion, {
          title,
          description,
          currentChapter: chapterLabel,
          content: getContext(scope, allowSpoilers)
        });
        // Response will be handled by socket listeners
        return;
      } catch (error) {
        console.log('Socket send failed, falling back to HTTP:', error);
        setUseSocket(false);
      }
    }

    // Fallback to HTTP API
    try {
      const answer = await askBookAssistant({
        title, description, chapterLabel, scope, spoilerFree: spoilerFree && !allowSpoilers,
        context: getContext(scope, allowSpoilers), messages: history, question: cleanQuestion,
      });
      setMessages(current => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: answer, isSpoiler: allowSpoilers }]);
    } catch {
      setMessages(current => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: 'I could not reach the reading assistant right now. Please check your connection and try again.' }]);
    } finally {
      setLoading(false);
      setPendingSpoilerQuestion(null);
    }
  };

  const regenerate = () => {
    const previousQuestion = [...messages].reverse().find(message => message.role === 'user');
    if (!previousQuestion || loading) return;
    setMessages(current => current.filter(message => message.id !== lastAssistant?.id));
    void send(previousQuestion.text);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.avatar}><Text style={styles.avatarText}>✦</Text></View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>AI BOOK CHAT</Text>
            <Text style={styles.title}>Chatting about {chapterLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => setMessages([])} accessibilityRole="button" accessibilityLabel="Start a new chat" style={styles.newChat}><Text style={styles.newChatText}>New chat</Text></TouchableOpacity>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close AI Book Chat" style={styles.close}><Text style={styles.closeText}>×</Text></TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scopeRow}>
            {scopeOptions.map(option => <TouchableOpacity key={option.value} onPress={() => setScope(option.value)} style={[styles.scope, scope === option.value && styles.scopeActive]}><Text style={[styles.scopeText, scope === option.value && styles.scopeTextActive]}>{option.label}</Text></TouchableOpacity>)}
          </ScrollView>
          <TouchableOpacity onPress={() => setSpoilerFree(value => !value)} style={[styles.spoiler, spoilerFree && styles.spoilerSafe]} accessibilityRole="switch" accessibilityState={{ checked: spoilerFree }}>
            <Text style={[styles.spoilerText, spoilerFree && styles.spoilerTextSafe]}>{spoilerFree ? '🛡 Spoiler-Free On' : '⚠ Spoilers allowed'}</Text>
          </TouchableOpacity>
          {usingOfflineAssistant && <Text style={styles.offlineNotice}>Offline mode · answers use only the book passages on your device</Text>}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow} style={styles.quickScroll}>
          {quickQuestions.map(question => <TouchableOpacity key={question} onPress={() => void send(question)} style={styles.quick}><Text style={styles.quickText}>{question}</Text></TouchableOpacity>)}
        </ScrollView>

        <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent} keyboardShouldPersistTaps="handled">
          {messages.length === 0 && <View style={styles.welcome}><View style={styles.welcomeAvatar}><Text>✦</Text></View><Text style={styles.welcomeTitle}>Your reading companion</Text><Text style={styles.welcomeCopy}>Ask anything about what you have read. I will stay grounded in {spoilerFree ? 'your current reading position' : 'the selected book scope'}.</Text></View>}
          {messages.map(message => <View key={message.id} style={[styles.message, message.role === 'user' ? styles.userMessage : styles.aiMessage]}>
            {message.role === 'assistant' && <Text style={styles.aiName}>{message.isSpoiler ? '✦ BOOKMINT AI · SPOILER' : '✦ BOOKMINT AI'}</Text>}
            <Text selectable style={[styles.messageText, message.role === 'user' ? styles.userText : styles.aiText]}>{message.text}</Text>
            {message.role === 'assistant' && <View style={styles.messageActions}><TouchableOpacity onPress={() => void Share.share({ message: message.text })}><Text style={styles.messageAction}>Copy / Share</Text></TouchableOpacity><TouchableOpacity onPress={() => onSaveResponse(message.text)}><Text style={styles.messageAction}>Save</Text></TouchableOpacity>{message.id === lastAssistant?.id && <TouchableOpacity onPress={regenerate}><Text style={styles.messageAction}>Regenerate</Text></TouchableOpacity>}</View>}
          </View>)}
          {loading && <View style={[styles.message, styles.aiMessage, styles.typing]}><ActivityIndicator size="small" color={Colors.primary} /><Text style={styles.typingText}>BookMint AI is reading…</Text></View>}
          {pendingSpoilerQuestion && <View style={styles.spoilerPrompt}><Text style={styles.spoilerPromptText}>Iska answer aage ke chapters mein reveal hota hai. Kya aap spoiler dekhna chahte hain?</Text><View style={styles.spoilerActions}><TouchableOpacity onPress={() => setPendingSpoilerQuestion(null)} style={styles.keepSafe}><Text style={styles.keepSafeText}>Keep Spoiler-Free</Text></TouchableOpacity><TouchableOpacity onPress={() => void send(pendingSpoilerQuestion, true)} style={styles.showSpoiler}><Text style={styles.showSpoilerText}>Show Spoiler</Text></TouchableOpacity></View></View>}
        </ScrollView>

        <View style={styles.composer}><TextInput value={input} onChangeText={setInput} placeholder="Ask about this book…" placeholderTextColor={Colors['on-surface-variant']} style={styles.input} multiline accessibilityLabel="Ask the AI about this book" /><TouchableOpacity onPress={() => void send()} disabled={!input.trim() || loading} style={[styles.send, (!input.trim() || loading) && styles.sendDisabled]} accessibilityRole="button" accessibilityLabel="Send question"><Text style={styles.sendText}>↑</Text></TouchableOpacity></View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background }, header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors['surface-container-high'] }, avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }, avatarText: { color: '#7EE0BA', fontSize: 20 }, headerCopy: { flex: 1, marginLeft: 10 }, eyebrow: { color: Colors.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1 }, title: { color: Colors.primary, fontSize: 14, fontWeight: '800', marginTop: 2 }, newChat: { padding: 8 }, newChatText: { color: Colors.primary, fontSize: 12, fontWeight: '800' }, close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }, closeText: { color: Colors.primary, fontSize: 28 }, controls: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors['surface-container-high'] }, scopeRow: { paddingHorizontal: Spacing.md, gap: 8 }, scope: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8, backgroundColor: Colors['surface-container-high'] }, scopeActive: { backgroundColor: Colors.primary }, scopeText: { color: Colors.primary, fontSize: 11, fontWeight: '800' }, scopeTextActive: { color: Colors.white }, spoiler: { alignSelf: 'flex-start', marginHorizontal: Spacing.md, marginTop: 9, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: Colors['error-container'] }, spoilerSafe: { backgroundColor: '#DCF7EA' }, spoilerText: { color: Colors.error, fontSize: 11, fontWeight: '800' }, spoilerTextSafe: { color: '#176B4C' }, offlineNotice: { color: Colors['on-surface-variant'], fontSize: 10, marginHorizontal: Spacing.md, marginTop: 8 }, quickScroll: { maxHeight: 53, borderBottomWidth: 1, borderBottomColor: Colors['surface-container-high'] }, quickRow: { gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 10 }, quick: { borderWidth: 1, borderColor: Colors['outline-variant'], borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8, backgroundColor: Colors['surface-container-lowest'] }, quickText: { color: Colors.primary, fontSize: 11, fontWeight: '700' }, messages: { flex: 1 }, messagesContent: { padding: Spacing.md, gap: 12 }, welcome: { alignItems: 'center', padding: 30, marginTop: 30 }, welcomeAvatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCF7EA' }, welcomeTitle: { color: Colors.primary, fontSize: 19, fontWeight: '800', marginTop: 14 }, welcomeCopy: { color: Colors['on-surface-variant'], textAlign: 'center', lineHeight: 20, marginTop: 8 }, message: { maxWidth: '88%', borderRadius: 18, padding: 13 }, userMessage: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 }, aiMessage: { alignSelf: 'flex-start', backgroundColor: Colors['surface-container-lowest'], borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors['surface-container-high'] }, aiName: { color: Colors.secondary, fontSize: 9, fontWeight: '800', letterSpacing: .6, marginBottom: 6 }, messageText: { fontSize: 15, lineHeight: 22 }, userText: { color: Colors.white }, aiText: { color: Colors['on-surface'] }, messageActions: { flexDirection: 'row', gap: 14, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors['surface-container-high'] }, messageAction: { color: Colors.primary, fontSize: 11, fontWeight: '800' }, typing: { flexDirection: 'row', gap: 8, alignItems: 'center' }, typingText: { color: Colors['on-surface-variant'], fontSize: 13 }, spoilerPrompt: { backgroundColor: '#FFF4DC', borderRadius: 16, padding: 14 }, spoilerPromptText: { color: '#6E4D0B', lineHeight: 20 }, spoilerActions: { flexDirection: 'row', gap: 8, marginTop: 12 }, keepSafe: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', backgroundColor: Colors['surface-container-lowest'] }, keepSafeText: { color: Colors.primary, fontSize: 11, fontWeight: '800' }, showSpoiler: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', backgroundColor: Colors.primary }, showSpoilerText: { color: Colors.white, fontSize: 11, fontWeight: '800' }, composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors['surface-container-high'], backgroundColor: Colors['surface-container-lowest'] }, input: { flex: 1, maxHeight: 105, minHeight: 46, borderRadius: 18, backgroundColor: Colors['surface-container-low'], paddingHorizontal: 14, paddingVertical: 11, color: Colors['on-surface'], fontSize: 15 }, send: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: .4 }, sendText: { color: Colors.white, fontSize: 25, fontWeight: '700', marginTop: -3 },
});
