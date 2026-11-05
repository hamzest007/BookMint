import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors } from '../theme/tokens';

interface HomeHeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onLogoPress?: () => void;
  avatarUri?: string;
  userName?: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  onNotificationPress,
  onProfilePress,
  onLogoPress,
  avatarUri,
  userName,
}) => {
  const fallbackInitial = userName?.trim()?.[0]?.toUpperCase() || 'R';

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onLogoPress} activeOpacity={0.7}>
        <Text style={styles.logo}>KitabHub</Text>
      </TouchableOpacity>

      {/* Right Side */}
      <View style={styles.right}>
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.iconButton}>
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onProfilePress}
          style={styles.profile}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.image}
            />
          ) : (
            <View style={styles.fallbackAvatar}>
              <Text style={styles.fallbackAvatarText}>{fallbackInitial}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },

  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    marginRight: 16,
  },

  icon: {
    fontSize: 21,
  },

  profile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },
  fallbackAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeHeader;
