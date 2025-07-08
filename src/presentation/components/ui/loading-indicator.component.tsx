import React, { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { createStyles } from "../../screens/publication/publication-screen.styles";
import { themeVariables } from "../../contexts/theme-context";

const LoadingIndicator: React.FC<{ theme: any; text: string }> = ({ theme, text }) => {
    const variables = useMemo(() => themeVariables(theme), [theme]);
    const styles = useMemo(() => createStyles(variables), [variables]);

    return (
    <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {text}
        </Text>
    </View>
    );
};

export default LoadingIndicator;