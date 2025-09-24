import React, { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { createStyles } from '../../screens/publication/publication-screen.styles';
import { themeVariables } from '../../contexts/theme.context';
import { Theme } from '../../contexts/theme.context';

const LoadingIndicator: React.FC<{ theme: Theme; text: string }> = ({
  theme,
  text
}) => {
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={variables['--primary']} />
      <Text
        style={[styles.loadingText, { color: variables['--text-secondary'] }]}
      >
        {text}
      </Text>
    </View>
  );
};

export default LoadingIndicator;
