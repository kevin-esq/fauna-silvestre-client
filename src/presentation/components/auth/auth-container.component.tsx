import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
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
    <>
      <StatusBar
        backgroundColor={variables['--background']}
        barStyle={
          variables['--text'] === '#E0E0E0' ? 'light-content' : 'dark-content'
        }
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: variables['--background'] }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Image source={icon} style={styles.logo} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.contentSection}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const createStyles = (variables: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: variables['--background'],
      minHeight: '100%'
    },
    headerSection: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 32,
      backgroundColor: variables['--background']
    },
    contentSection: {
      flex: 1,
      paddingHorizontal: 24,
      paddingBottom: 24
    },
    logo: {
      width: 120,
      height: 120,
      alignSelf: 'center',
      marginBottom: 24,
      resizeMode: 'contain',
      shadowColor: variables['--shadow'],
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      textAlign: 'center',
      color: variables['--text'],
      marginBottom: 8,
      letterSpacing: -0.5
    },
    subtitle: {
      fontSize: 16,
      color: variables['--text-secondary'],
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 280
    }
  });

export default React.memo(AuthContainer);

