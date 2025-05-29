import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ChatBubble = ({ role, text, onSpeech, isSpeaking }) => {
  const isUser = role === 'user';
  
  return (
    <View style={[
      styles.container, 
      isUser ? styles.userContainer : styles.botContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={isUser ? styles.userText : styles.botText}>
          {text}
        </Text>
      </View>
      
      {!isUser && (
        <TouchableOpacity 
          style={styles.speechButton} 
          onPress={onSpeech}
        >
          <Ionicons 
            name={isSpeaking ? 'stop-circle' : 'volume-medium'} 
            size={24} 
            color={isSpeaking ? '#FF3B30' : '#007AFF'} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 2,
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  botText: {
    color: '#1C1C1E',
    fontSize: 16,
  },
  speechButton: {
    position: 'absolute',
    right: -30,
    top: 0,
    padding: 8,
  },
});

export default ChatBubble;