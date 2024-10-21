import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NDKUser, Hexpubkey, NDKEvent } from '@nostr-dev-kit/ndk';
import { View } from "@/components/Themed";
import { Image } from 'expo-image';
import { UserProvider, useUser } from './UserProvider';

interface UserListItemProps {
  user?: NDKUser;
  pubkey?: Hexpubkey;
  event?: NDKEvent;
  count?: number;
  onPress?: () => void;
}

const UserListItemContent: React.FC<{ event?: NDKEvent, count?: number }> = ({ event, count }) => {
  const { userProfile, isLoading, error } = useUser();

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: userProfile?.image || '/default-avatar.png' }}
          alt={userProfile?.displayName || userProfile?.name || 'User'}
          style={styles.avatar}
          contentFit="cover"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>
          {userProfile?.displayName || userProfile?.name || (userProfile && Object.keys(userProfile)) || 'Anonymous User'}
        </Text>
        {event ? (
          <Text style={styles.description} numberOfLines={1}>{event.content}</Text>
        ): (
          <Text style={styles.handle}>{userProfile?.nip05 || '@' + userProfile?.npub?.slice(0, 8)}</Text>
        )}
      </View>
      {count !== undefined && (
        <View style={styles.count}>
          <Text>{count}</Text>
        </View>
      )}
    </View>
  );
};

const UserListItem: React.FC<UserListItemProps> = ({ user, pubkey, event, count, onPress }) => { // {{ edit_2 }}
  return (
    <UserProvider user={user} pubkey={pubkey}>
      <TouchableOpacity onPress={onPress}>
        <UserListItemContent event={event} count={count} />
      </TouchableOpacity>
    </UserProvider>
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

export default UserListItem;
