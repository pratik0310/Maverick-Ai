import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Appearance,
  useColorScheme
} from 'react-native';
import axios from "axios";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { speak, isSpeakingAsync, stop } from "expo-speech";

const ChatBubble = ({ role, text, onSpeech, isSpeaking, colors }) => {
  const isUser = role === 'user';
  return (
    <View style={[
      styles.bubbleContainer,
      isUser ? styles.userBubbleContainer : styles.botBubbleContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? { backgroundColor: colors.userBubble } : { backgroundColor: colors.botBubble }
      ]}>
        <Text style={isUser ? styles.userText : { ...styles.botText, color: colors.text }}>
          {text}
        </Text>
        <TouchableOpacity onPress={onSpeech} style={styles.speechButton}>
          <Ionicons 
            name={isSpeaking ? "volume-high" : "volume-medium"} 
            size={20} 
            color={isUser ? colors.userText : colors.text} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Chatbot = () => {
    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');
    const API_KEY = "YOUR_GEMINI_API_KEY";

    const colorScheme = useColorScheme();
    
    useEffect(() => {
      setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);

    const colors = {
      background: isDarkMode ? '#121212' : '#f5f5f5',
      header: isDarkMode ? '#1f1f1f' : '#ffffff',
      text: isDarkMode ? '#ffffff' : '#000000',
      input: isDarkMode ? '#2a2a2a' : '#ffffff',
      inputText: isDarkMode ? '#ffffff' : '#000000',
      placeholder: isDarkMode ? '#aaaaaa' : '#666666',
      userBubble: isDarkMode ? '#6e48aa' : '#6e48aa',
      botBubble: isDarkMode ? '#2a2a2a' : '#e0e0e0',
      userText: '#ffffff',
      sendButton: '#6e48aa',
      border: isDarkMode ? '#333333' : '#dddddd',
      error: isDarkMode ? '#ff6b6b' : '#ff4444',
      emptyText: isDarkMode ? '#aaaaaa' : '#666666'
    };

    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
    };

    const handleNewChat = () => {
        if (chat.length > 0) {
            Alert.alert(
                "New Chat",
                "Are you sure you want to start a new chat?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    { 
                        text: "New Chat", 
                        onPress: () => {
                            setChat([]);
                            setUserInput("");
                            setError(null);
                            if (isSpeaking) {
                                stop();
                                setIsSpeaking(false);
                            }
                        }
                    }
                ]
            );
        }
    };

    const handleUserInput = async () => {
        if (!userInput.trim()) return;

        let updatedChat = [
            ...chat,
            {
                role: "user",
                parts: [{ text: userInput }],
            },
        ];
        
        setChat(updatedChat);
        setUserInput("");
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    contents: updatedChat,
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const modelResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";

            const updatedChatWithModel = [
                ...updatedChat,
                {
                    role: "model",
                    parts: [{ text: modelResponse }],
                },
            ];
            setChat(updatedChatWithModel);

        } catch (error) {
            console.log("error calling API:", error);
            setError("Failed to get response from chatbot");
        } finally {
            setLoading(false);
        }
    };

    const handleSpeech = async (text) => {
        if (isSpeaking) {
            await stop();
            setIsSpeaking(false);
        } else {
            if (!(await isSpeakingAsync())) {
                await speak(text);
                setIsSpeaking(true);
            }
        }
    };

    const renderChatItem = ({ item }) => (
        <ChatBubble
            role={item.role}
            text={item.parts[0].text}
            onSpeech={() => handleSpeech(item.parts[0].text)}
            isSpeaking={isSpeaking}
            colors={colors}
        />
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Top Navigation Bar */}
                <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
                        <MaterialIcons name="add" size={24} color={colors.sendButton} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>MaVerickAi</Text>
                    <TouchableOpacity onPress={toggleDarkMode} style={styles.darkModeButton}>
                        <Ionicons 
                            name={isDarkMode ? "sunny" : "moon"} 
                            size={24} 
                            color={colors.sendButton} 
                        />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView 
                    style={styles.chatArea}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={90}
                >
                    <FlatList
                        data={chat}
                        renderItem={renderChatItem}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={[
                            styles.chatContainer,
                            chat.length === 0 && styles.emptyChatContainer
                        ]}
                        inverted={false}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyChat}>
                                <Ionicons name="chatbox-ellipses" size={50} color={colors.emptyText} />
                                <Text style={[styles.emptyChatText, { color: colors.emptyText }]}>
                                    Start a new conversation
                                </Text>
                            </View>
                        }
                    />

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.sendButton} />
                        </View>
                    )}
                    {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

                    <View style={[styles.inputContainer, { backgroundColor: colors.header, borderTopColor: colors.border }]}>
                        <TextInput
                            style={[
                                styles.input,
                                { 
                                    backgroundColor: colors.input,
                                    color: colors.inputText,
                                    borderColor: colors.border
                                }
                            ]}
                            value={userInput}
                            onChangeText={setUserInput}
                            placeholder="Type your message..."
                            placeholderTextColor={colors.placeholder}
                            onSubmitEditing={handleUserInput}
                            multiline
                        />
                        <TouchableOpacity 
                            style={[styles.sendButton, { backgroundColor: colors.sendButton }]} 
                            onPress={handleUserInput}
                            disabled={loading}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    newChatButton: {
        width: 40,
        alignItems: 'flex-start',
    },
    darkModeButton: {
        width: 40,
        alignItems: 'flex-end',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        fontStyle:'italic',
        flex: 1,
        fontFamily:'Inter'
    },
    chatArea: {
        flex: 1,
    },
    chatContainer: {
        padding: 15,
        paddingBottom: 15,
    },
    emptyChatContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyChat: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyChatText: {
        marginTop: 10,
        fontSize: 16,
    },
    loadingContainer: {
        padding: 10,
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        maxHeight: 100,
        marginRight: 10,
    },
    sendButton: {
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        textAlign: 'center',
        padding: 10,
        borderRadius: 5,
        margin: 10,
    },
    bubbleContainer: {
        marginVertical: 4,
        paddingHorizontal: 10,
    },
    userBubbleContainer: {
        alignItems: 'flex-end',
    },
    botBubbleContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userText: {
        color: '#ffffff',
        flex: 1,
    },
    botText: {
        flex: 1,
    },
    speechButton: {
        marginLeft: 8,
    },
});

export default Chatbot;