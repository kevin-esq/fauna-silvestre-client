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
import { ThemeVariablesType } from '@/presentation/contexts/theme.context';

interface AuthContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  variables: ThemeVariablesType;
  titleIcon?: React.ReactNode;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  title,
  subtitle,
  children,
  variables,
  titleIcon
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
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {titleIcon && (
                <View style={styles.titleIconContainer}>{titleIcon}</View>
              )}
            </View>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.contentSection}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const createStyles = (variables: ThemeVariablesType) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: variables['--background'],
      minHeight: '100%'
    },
    headerSection: {
      alignItems: 'center',
      paddingHorizontal: variables['--spacing-large'],
      paddingTop:
        variables['--spacing-xxlarge'] + variables['--spacing-medium'],
      paddingBottom: variables['--spacing-large'],
      backgroundColor: variables['--background']
    },
    contentSection: {
      flex: 1,
      paddingHorizontal: variables['--spacing-large'],
      paddingBottom: variables['--spacing-large']
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: variables['--spacing-medium'],
      resizeMode: 'contain',
      shadowColor: variables['--shadow'],
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: variables['--spacing-small'],
      marginBottom: variables['--spacing-tiny']
    },
    titleIconContainer: {
      width: variables['--icon-size-large'],
      height: variables['--icon-size-large'],
      borderRadius: variables['--border-radius-large'],
      backgroundColor: variables['--primary'] + '15',
      justifyContent: 'center',
      alignItems: 'center'
    },
    title: {
      fontSize: variables['--font-size-xxlarge'],
      fontWeight: variables['--font-weight-bold'],
      color: variables['--text'],
      textAlign: 'center'
    },
    subtitle: {
      fontSize: variables['--font-size-medium'],
      fontWeight: variables['--font-weight-regular'],
      color: variables['--text-secondary'],
      textAlign: 'center',
      lineHeight: variables['--line-height-large'],
      maxWidth: 320,
      marginTop: variables['--spacing-tiny']
    }
  });

export default React.memo(AuthContainer);
