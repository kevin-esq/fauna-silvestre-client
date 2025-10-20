import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
  ImageSourcePropType
} from 'react-native';
import ConaforLogo from '@/assets/sponsors/conafor.jpeg';
import MayasurLogo from '@/assets/sponsors/mayasur.jpeg';
import FomentoLogo from '@/assets/sponsors/fomento.jpg';

interface SponsorData {
  name: string;
  role: string;
  website?: string;
  color?: string;
  logo: ImageSourcePropType | string;
  description?: string;
}

interface SponsorsFooterProps {
  variables: ThemeVariablesType;
}

const SponsorsFooter: React.FC<SponsorsFooterProps> = ({ variables }) => {
  const styles = useMemo(() => createStyles(variables), [variables]);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const sponsors: SponsorData[] = [
    {
      name: 'CONAFOR',
      role: 'Comisión Nacional Forestal',
      website: 'https://www.conafor.gob.mx/',
      color: variables['--forest'],
      logo: ConaforLogo,
      description:
        'Organismo público descentralizado de México cuyo objetivo es promover y desarrollar las actividades productivas, de conservación y restauración de los ecosistemas forestales del país'
    },
    {
      name: 'Fomento Al Desarrollo Social y Manejo de Vida Silvestre A.C.',
      role: 'Investigación & Desarrollo',
      color: variables['--leaf'],
      logo: FomentoLogo,
      description: 'Soluciones científicas para el futuro'
    },
    {
      name: 'MAYA SUR SYSTEMS',
      role: 'Desarrollador de la aplicación',
      color: variables['--water'],
      logo: MayasurLogo,
      description: 'Innovación tecnológica para el desarrollo sostenible'
    }
  ];

  const handleSponsorPress = async (website?: string, name?: string) => {
    if (!website) {
      Alert.alert('Sin enlace', `${name} no tiene un sitio web disponible.`);
      return;
    }

    try {
      await Linking.openURL(website);
    } catch (error) {
      console.error('Error opening URL:', error);
      try {
        const canOpen = await Linking.canOpenURL(website);
        if (canOpen) {
          await Linking.openURL(website);
        } else {
          Alert.alert(
            'Enlace no disponible',
            'Este enlace no se puede abrir en tu dispositivo. Verifica tu conexión a internet.',
            [{ text: 'OK' }]
          );
        }
      } catch {}
    }
  };

  const handleImageError = (index: number) => {
    console.warn(`Error loading image for sponsor at index ${index}`);
    setImageErrors(prev => new Set(prev).add(index));
  };

  const getImageSource = (logo: ImageSourcePropType | string) => {
    if (typeof logo === 'number') {
      return logo;
    }
    if (typeof logo === 'string') {
      return { uri: logo };
    }
    return logo;
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.divider} />

      <Text style={styles.footerTitle}>Apoyado por</Text>

      <View style={styles.sponsorsGrid}>
        {sponsors.map((sponsor, index) => {
          const imageSource = getImageSource(sponsor.logo);
          const hasError = imageErrors.has(index);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.sponsorCard,
                pressedIndex === index && styles.sponsorCardPressed,
                !sponsor.website && styles.sponsorCardDisabled
              ]}
              onPressIn={() => setPressedIndex(index)}
              onPressOut={() => setPressedIndex(null)}
              onPress={() => handleSponsorPress(sponsor.website, sponsor.name)}
              activeOpacity={0.8}
              disabled={!sponsor.website}
            >
              <View
                style={[
                  styles.logoContainer,
                  { backgroundColor: sponsor.color || variables['--primary'] }
                ]}
              >
                {!hasError ? (
                  <Image
                    source={imageSource}
                    style={styles.logoImage}
                    resizeMode="contain"
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <Text style={styles.logoFallback}>
                    {sponsor.name.substring(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={styles.sponsorContent}>
                <View style={styles.sponsorHeader}>
                  <Text style={styles.sponsorName} numberOfLines={2}>
                    {sponsor.name}
                  </Text>
                  {sponsor.website && (
                    <View style={styles.linkBadge}>
                      <Text style={styles.linkBadgeText}>🔗 Visitar</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sponsorRole}>{sponsor.role}</Text>
                {sponsor.description && (
                  <Text style={styles.sponsorDescription} numberOfLines={3}>
                    {sponsor.description}
                  </Text>
                )}
                {sponsor.website && (
                  <Text style={styles.tapHint}>
                    Toca para visitar sitio web
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.creditsSection}>
        <Text style={styles.creditsTitle}>Colaboradores</Text>
        <Text style={styles.creditsText}>
          Esta aplicación es posible gracias a la colaboración de empresas
          comprometidas con la sostenibilidad y la innovación tecnológica.
        </Text>
      </View>

      <View style={styles.copyrightSection}>
        <Text style={styles.copyrightText}>
          © 2025 k'aaxil ba'alilche' - Versión 1.0.0
        </Text>
        <Text style={styles.poweredByText}>Powered by React Native</Text>
      </View>
    </View>
  );
};

const createStyles = (variables: ThemeVariablesType) =>
  StyleSheet.create({
    footerContainer: {
      marginTop: 32,
      paddingTop: 24,
      paddingBottom: 16
    },
    divider: {
      height: 2,
      backgroundColor: variables['--primary'],
      marginBottom: 20,
      borderRadius: 1,
      opacity: 0.3
    },
    footerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: variables['--text'],
      textAlign: 'center',
      marginBottom: 16
    },
    sponsorsGrid: {
      marginBottom: 24
    },
    sponsorCard: {
      backgroundColor: variables['--card-background'],
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: variables['--shadow'],
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: variables['--border']
    },
    sponsorCardPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.9
    },
    sponsorCardDisabled: {
      opacity: 0.7
    },
    logoContainer: {
      width: 64,
      height: 64,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: variables['--shadow'],
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden'
    },
    logoImage: {
      width: '100%',
      height: '100%'
    },
    logoFallback: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF'
    },
    sponsorContent: {
      flex: 1
    },
    sponsorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    },
    sponsorName: {
      fontSize: 17,
      fontWeight: '700',
      color: variables['--text'],
      flex: 1,
      paddingRight: 8
    },
    sponsorRole: {
      fontSize: 13,
      color: variables['--primary'],
      fontWeight: '600',
      marginBottom: 4
    },
    sponsorDescription: {
      fontSize: 12,
      color: variables['--text-secondary'],
      lineHeight: 16,
      marginTop: 2
    },
    tapHint: {
      fontSize: 10,
      color: variables['--primary'],
      fontStyle: 'italic',
      marginTop: 6,
      opacity: 0.8
    },
    linkBadge: {
      backgroundColor: variables['--primary'],
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginLeft: 8
    },
    linkBadgeText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    creditsSection: {
      backgroundColor: variables['--surface-variant'],
      padding: 16,
      borderRadius: 12,
      marginBottom: 20
    },
    creditsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: variables['--primary'],
      marginBottom: 8,
      textAlign: 'center'
    },
    creditsText: {
      fontSize: 13,
      color: variables['--text-secondary'],
      textAlign: 'center',
      lineHeight: 18
    },
    copyrightSection: {
      alignItems: 'center'
    },
    copyrightText: {
      fontSize: 12,
      color: variables['--text-secondary'],
      textAlign: 'center',
      marginBottom: 4
    },
    poweredByText: {
      fontSize: 11,
      color: variables['--text-secondary'],
      textAlign: 'center',
      opacity: 0.7
    }
  });

export default React.memo(SponsorsFooter);
