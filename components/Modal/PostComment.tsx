import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const PostComment = () => {
  const router = useRouter();
  const { photoUri, setCaption, handlePost } = useLocalSearchParams();
  const [localCaption, setLocalCaption] = useState('');

  const handleSave = () => {
    setCaption(localCaption);
    handlePost();
    router.back();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.captionInput}
        placeholder="Write a caption..."
        value={localCaption}
        onChangeText={setLocalCaption}
        multiline
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  captionInput: {
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#0095f6',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PostComment;
