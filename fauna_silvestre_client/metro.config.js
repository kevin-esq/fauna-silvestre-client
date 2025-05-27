const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Configuración personalizada
const customConfig = {
    resolver: {
        sourceExts: ['env.js', 'js', 'ts', 'tsx', 'json'],
        // Añade esto para react-native-config
        extraNodeModules: {
            '@env': `${__dirname}/node_modules/react-native-dotenv`,
        },
    },
    // ¡Esta parte está mal! Metro no maneja variables así:
    // extra: {
    //   API_BASE_URL: process.env.API_BASE_URL,
    //   API_TIMEOUT: process.env.API_TIMEOUT,
    // }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), customConfig);