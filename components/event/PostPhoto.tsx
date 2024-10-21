import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PostPhotoProps {
  photoUri: string;
  onPost: (caption: string) => void;
}

const PostPhoto: React.FC<PostPhotoProps> = ({ photoUri, onPost }) => {
  const [caption, setCaption] = useState('');
  const router = useRouter();

  const handlePost = () => {
    onPost(caption);
    router.push('/home');
  };

  const openCaptionModal = () => {
    router.push({
      pathname: '/modal',
      params: { photoUri, setCaption, handlePost }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePost}>
          <Ionicons name="checkmark" size={24} color="#0095f6" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Image source={{ uri: photoUri }} style={styles.image} />
        <TouchableOpacity style={styles.captionButton} onPress={openCaptionModal}>
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
  captionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 10,
  },
});

export default PostPhoto;
