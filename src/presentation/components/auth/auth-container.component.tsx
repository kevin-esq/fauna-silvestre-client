import React, { useMemo } from 'react';
import { useTheme } from '../../contexts/theme-context';
import {
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

interface AuthContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ title, subtitle, children }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../../assets/favicon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
        padding: 24,
    backgroundColor: colors.background,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
        fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
  },
  subtitle: {
        fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default React.memo(AuthContainer);