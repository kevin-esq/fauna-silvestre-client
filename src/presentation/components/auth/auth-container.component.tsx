import React, { useMemo } from 'react';
import {
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import icon from '../../../assets/icon.png';

interface AuthContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  variables: Record<string, string>;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  title,
  subtitle,
  children,
  variables
}) => {
  const styles = useMemo(() => createStyles(variables), [variables]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: variables['--background'] }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={icon} style={styles.logo} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (variables: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: variables['--background']
    },
    logo: {
      width: 150,
      height: 150,
      alignSelf: 'center',
      marginBottom: 16,
      resizeMode: 'contain'
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      textAlign: 'center',
      color: variables['--text']
    },
    subtitle: {
      fontSize: 16,
      color: variables['--text-secondary'],
      textAlign: 'center',
      marginBottom: 24
    }
  });

export default React.memo(AuthContainer);
