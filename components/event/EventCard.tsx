import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps {
  event: NDKEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [authorProfile, setAuthorProfile] = useState<NDKUserProfile | null>(null);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const image = event.tagValue("url");
  const title = event.tagValue("title");
  const description = event.content;

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        const profile = await event.author.fetchProfile();
        setAuthorProfile(profile);
      } catch (error) {
        console.error('Error fetching author profile:', error);
      }
    };

    fetchAuthorProfile();
  }, [event.author]);

  const onImageLoad = (event: any) => {
    const { width, height } = event.source;
    setImageAspectRatio(width / height);
  };

  const screenHeight = Dimensions.get('window').height;
  const maxImageHeight = screenHeight * 0.5;

  return (
    <View style={styles.card}>
      {/* Header: User info and options */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: authorProfile?.image || 'https://example.com/default-avatar.png' }}
            style={styles.avatar}
            contentFit="cover"
          />
          <Text style={styles.username}>
            {authorProfile?.displayName || authorProfile?.name || 'Anonymous'}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Event image */}
      {image && (
        <TouchableOpacity onPress={() => setIsImageViewVisible(true)}>
          <Image
            source={{ uri: image }}
            style={[
              styles.eventImage,
              {
                aspectRatio: imageAspectRatio,
                maxHeight: maxImageHeight,
                minWidth: '100%',
              },
            ]}
            contentFit="cover"
            onLoad={onImageLoad}
          />
        </TouchableOpacity>
      )}

      {/* Image Viewer */}
      {isImageViewVisible && (
        <TouchableOpacity onPress={() => setIsImageViewVisible(false)}>
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
          />
        </TouchableOpacity>
      )}

      <View style={styles.contentContainer}>
        {/* Event title */}
        {title && (
          <Text style={styles.title}>{title}</Text>
        )}

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.leftButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Event details */}
        {description && (
          <View style={styles.eventDetails}>
            <Text style={styles.description}>{description}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    overflow: 'hidden', // This ensures the image doesn't overflow the card's rounded corners
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventImage: {
    width: '100%',
  } as ImageStyle,
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingTop: 10,
    marginRight: 10,
  },
  eventDetails: {
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  contentContainer: {
    paddingTop: 0,
    padding: 20,
  },
});

export default EventCard;
