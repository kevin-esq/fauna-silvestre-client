import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedPressable from '../ui/animated-pressable.component';

export interface UserModel {
    id: string;
    name: string;
    userName: string;
    email: string;
    locality: string;
    role: string;
    avatarUrl?: string;
}

interface UserCardProps {
    user: UserModel;
    onPress: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onPress }) => {
    const { name, userName, email, locality, role, avatarUrl } = user;

    return (
        <AnimatedPressable style={styles.card} onPress={onPress}>
            {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.image} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <FontAwesome name="user" size={48} color="#BDBDBD" />
                </View>
            )}
            <View style={styles.content}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.username}>@{userName}</Text>
                <View style={styles.infoRow}>
                    <FontAwesome name="envelope" size={16} color="#555" />
                    <Text style={styles.infoText}>{email}</Text>
                </View>
                <View style={styles.infoRow}>
                    <FontAwesome name="map-marker" size={16} color="#2196F3" />
                    <Text style={styles.infoText}>{locality}</Text>
                </View>
                <View style={styles.infoRow}>
                    <FontAwesome name="user-circle" size={16} color="#673AB7" />
                    <Text style={styles.infoText}>{role}</Text>
                </View>
            </View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    image: {
        width: '100%',
        height: 180,
    },
    imagePlaceholder: {
        width: '100%',
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
    },
    content: {
        padding: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    username: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#444',
    },
});

export default UserCard;