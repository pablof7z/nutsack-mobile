import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { View } from "@/components/Themed";
import { Image } from 'expo-image';

interface TopicListItemProps {
  topic: string;
  event: NDKEvent;
  count: number;
  onPress?: () => void;
}

const TopicListItem: React.FC<TopicListItemProps> = ({ topic, event, count, onPress }) => {
  return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.container}>
          <View style={styles.avatarContainer}>
            {/* <Image
              source={{ uri: userProfile?.image || '/default-avatar.png' }}
              alt={userProfile?.displayName || userProfile?.name || 'User'}
              style={styles.avatar}
              contentFit="cover"
            /> */}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name}>
              #{topic}
            </Text>
            <Text style={styles.description} numberOfLines={1}>{event.content}</Text>
          </View>
          {count !== undefined && (
            <View style={styles.count}>
              <Text>{count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
  },
  avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
  },
  textContainer: {
      flex: 1,
  },
  name: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
  },
  description: {
      fontSize: 14,
      color: '#666',
  },
  swipeAction: {
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'flex-end',
      padding: 20,
      width: 100,
  },
  swipeActionText: {
      color: 'white',
      fontWeight: 'bold',
  },
  pinnedIndicator: {
      fontSize: 20,
      marginLeft: 10,
  },
  count: {
      fontSize: 14,
      color: '#666',
      marginLeft: 12,
      fontWeight: 'bold',
      marginRight: 12,
      backgroundColor: '#e0e0e0',
      padding: 4,
      borderRadius: 20,
      paddingLeft: 10,
      paddingRight: 10,
  },
});

export default TopicListItem;
