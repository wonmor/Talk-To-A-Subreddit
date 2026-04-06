import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { io } from 'socket.io-client';

// Change this to your server URL
const SERVER_URL = 'https://talkreddit.apps.johnseong.com';

const POPULAR_SUBREDDITS = [
  'AskReddit', 'technology', 'science', 'gaming',
  'movies', 'music', 'worldnews', 'philosophy',
];

export default function App() {
  const [screen, setScreen] = useState('name'); // 'name' | 'subreddit' | 'chat'
  const [username, setUsername] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectToServer = () => {
    const sub = subreddit.trim().replace(/^r\//, '');
    if (!sub) {
      setError('Please enter a subreddit name.');
      return;
    }

    setError('');
    setSubreddit(sub);

    const socket = io(SERVER_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socketRef.current = socket;
      setChatHistory([]);
      setScreen('chat');
    });

    socket.on('connect_error', () => {
      setError('Failed to connect to server. Check your connection.');
    });

    socket.on('reply', ({ name, message: replyMsg, keywords }) => {
      setIsThinking(false);
      setStatusText('');
      setChatHistory(prev => [...prev, { name, message: replyMsg, keywords, id: Date.now().toString() }]);
    });

    socket.on('status', ({ message: statusMsg }) => {
      setStatusText(statusMsg || 'Thinking...');
    });
  };

  const sendMessage = () => {
    if (!message.trim() || isThinking || !socketRef.current) return;

    const userMsg = message.trim();
    setMessage('');
    setIsThinking(true);

    setChatHistory(prev => [...prev, { name: username, message: userMsg, id: Date.now().toString() }]);

    socketRef.current.emit('message', {
      name: username,
      message: userMsg,
      subreddit: subreddit,
    });
  };

  const handleBack = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setChatHistory([]);
    setIsThinking(false);
    setScreen('subreddit');
  };

  // --- SCREENS ---

  if (screen === 'name') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.setupContainer}>
          <Text style={styles.title}>Talk to a Subreddit</Text>
          <Text style={styles.subtitle}>Chat with any subreddit as if it were a person.</Text>

          <Text style={styles.label}>What should I call you?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name..."
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            onSubmitEditing={() => {
              if (username.trim()) {
                setError('');
                setScreen('subreddit');
              } else {
                setError('Please enter your name.');
              }
            }}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (username.trim()) {
                setError('');
                setScreen('subreddit');
              } else {
                setError('Please enter your name.');
              }
            }}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'subreddit') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.setupContainer}>
          <Text style={styles.welcomeText}>Welcome, {username}.</Text>
          <Text style={styles.title}>Choose a Subreddit</Text>
          <Text style={styles.subtitle}>
            Powered by live Reddit data. No API keys needed.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. AskReddit, philosophy, gaming..."
            placeholderTextColor="#666"
            value={subreddit}
            onChangeText={setSubreddit}
            onSubmitEditing={connectToServer}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipRow}>
              {POPULAR_SUBREDDITS.map(name => (
                <TouchableOpacity
                  key={name}
                  style={[styles.chip, subreddit === name && styles.chipSelected]}
                  onPress={() => setSubreddit(name)}
                >
                  <Text style={[styles.chipText, subreddit === name && styles.chipTextSelected]}>
                    r/{name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={connectToServer}>
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Chat screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            r/<Text style={styles.orange}>{subreddit}</Text>
          </Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={item => item.id}
          style={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>
                <Text style={{ color: item.name === username ? '#ffbdf4' : '#bdefff', fontWeight: 'bold' }}>
                  {item.name}
                </Text>
                : {item.message}
              </Text>
              {item.keywords && (
                <Text style={styles.keywords}>searched: {item.keywords}</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Say something to r/{subreddit}!
              </Text>
            </View>
          }
        />

        {/* Thinking indicator */}
        {isThinking && statusText ? (
          <View style={styles.thinkingRow}>
            <ActivityIndicator size="small" color="#bdefff" />
            <Text style={styles.thinkingText}>{statusText}</Text>
          </View>
        ) : null}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder={`Ask r/${subreddit} anything...`}
            placeholderTextColor="#666"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
            editable={!isThinking}
          />
          <TouchableOpacity
            style={[styles.sendButton, isThinking && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={isThinking}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  setupContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 20,
    color: '#bdefff',
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    color: '#ffbdf4',
    marginBottom: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2a2a4a',
    color: '#fff',
    fontSize: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#e67e22',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 8,
    fontSize: 14,
  },
  chipScroll: {
    marginBottom: 16,
    maxHeight: 44,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e67e22',
  },
  chipSelected: {
    backgroundColor: '#e67e22',
  },
  chipText: {
    color: '#e67e22',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#fff',
  },
  // Chat screen
  chatContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    color: '#e67e22',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  orange: {
    color: '#e67e22',
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    marginBottom: 12,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  keywords: {
    color: '#555',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyChatText: {
    color: '#666',
    fontSize: 16,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  thinkingText: {
    color: '#bdefff',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#2a2a4a',
    color: '#fff',
    fontSize: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  sendButton: {
    backgroundColor: '#e67e22',
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
