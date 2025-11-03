import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  ImageSourcePropType
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomModal from '@/presentation/components/ui/custom-modal.component';
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

interface DeveloperData {
  name: string;
  role: string;
  description: string;
  icon: string;
}

interface SponsorsFooterProps {
  variables: ThemeVariablesType;
  mode?: 'footer' | 'screen';
}

const SponsorsFooter: React.FC<SponsorsFooterProps> = ({
  variables,
  mode = 'footer'
}) => {
  const styles = useMemo(
    () => createStyles(variables, mode),
    [variables, mode]
  );
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isDevelopmentTeamExpanded, setIsDevelopmentTeamExpanded] =
    useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: ''
  });

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
    }
  ];

  const developers: DeveloperData[] = [
    {
      name: 'Alexis Sherioshar Yama Moguel',
      role: 'Project Manager',
      description: 'Gestión y coordinación del proyecto',
      icon: 'account-tie'
    },
    {
      name: 'Ulises Antonio Montalvo Campos',
      role: 'Desarrollador Backend',
      description: 'Arquitectura y desarrollo del servidor',
      icon: 'server'
    },
    {
      name: 'Kevin Alexander Esquivel Hernandez',
      role: 'Desarrollador Frontend',
      description: 'Diseño y desarrollo de la interfaz de usuario',
      icon: 'monitor-edit'
    }
  ];

  const handleSponsorPress = async (website?: string, name?: string) => {
    if (!website) {
      setErrorModal({
        visible: true,
        title: 'Sin enlace',
        message: `${name} no tiene un sitio web disponible.`
      });
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
          setErrorModal({
            visible: true,
            title: 'Enlace no disponible',
            message:
              'Este enlace no se puede abrir en tu dispositivo. Verifica tu conexión a internet.'
          });
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
                      <Icon name="link-variant" size={12} color="#FFFFFF" />
                      <Text style={styles.linkBadgeText}>Visitar</Text>
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

      <View style={styles.developmentCompanySection}>
        <TouchableOpacity
          style={styles.developmentTeamHeader}
          onPress={() =>
            setIsDevelopmentTeamExpanded(!isDevelopmentTeamExpanded)
          }
          activeOpacity={0.7}
        >
          <View style={styles.companyLogoContainer}>
            <Image
              source={MayasurLogo}
              style={styles.companyLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>MAYA SUR SYSTEMS</Text>
            <Text style={styles.teamSubtitle}>Empresa de Desarrollo</Text>
          </View>
          <Icon
            name={isDevelopmentTeamExpanded ? 'chevron-up' : 'chevron-down'}
            size={28}
            color={variables['--primary']}
          />
        </TouchableOpacity>

        {isDevelopmentTeamExpanded && (
          <View style={styles.developersContainer}>
            <Text style={styles.teamMembersTitle}>Equipo de Desarrollo</Text>
            {developers.map((dev, index) => (
              <View key={index} style={styles.developerCard}>
                <View style={styles.developerIcon}>
                  <Icon name={dev.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.developerInfo}>
                  <Text style={styles.developerName}>{dev.name}</Text>
                  <Text style={styles.developerRole}>{dev.role}</Text>
                  <Text style={styles.developerDescription}>
                    {dev.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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

      <CustomModal
        isVisible={errorModal.visible}
        onClose={() =>
          setErrorModal({ visible: false, title: '', message: '' })
        }
        title={errorModal.title}
        description={errorModal.message}
        type="alert"
        size="small"
        centered
        showFooter
        buttons={[
          {
            label: 'OK',
            onPress: () =>
              setErrorModal({ visible: false, title: '', message: '' }),
            variant: 'primary'
          }
        ]}
      />
    </View>
  );
};

const createStyles = (
  variables: ThemeVariablesType,
  mode: 'footer' | 'screen' = 'footer'
) =>
  StyleSheet.create({
    footerContainer: {
      marginTop: mode === 'screen' ? 0 : 32,
      paddingTop: mode === 'screen' ? 0 : 24,
      paddingBottom: mode === 'screen' ? 0 : 16,
      paddingHorizontal: mode === 'screen' ? 0 : undefined
    },
    divider: {
      height: mode === 'screen' ? 0 : 2,
      backgroundColor: variables['--primary'],
      marginBottom: mode === 'screen' ? 0 : 20,
      borderRadius: variables['--border-radius-medium'],
      opacity: 0.3
    },
    footerTitle: {
      fontSize: mode === 'screen' ? 24 : 18,
      fontWeight: mode === 'screen' ? '700' : '600',
      color: variables['--text'],
      textAlign: 'center',
      marginBottom: mode === 'screen' ? 24 : 16
    },
    sponsorsGrid: {
      marginBottom: 24
    },
    sponsorCard: {
      backgroundColor: variables['--card-background'],
      padding: mode === 'screen' ? 20 : 16,
      borderRadius:
        mode === 'screen'
          ? variables['--border-radius-large']
          : variables['--border-radius-medium'],
      marginBottom: mode === 'screen' ? 20 : 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: variables['--shadow'],
      shadowOffset: {
        width: 0,
        height: mode === 'screen' ? 6 : 4
      },
      shadowOpacity: mode === 'screen' ? 0.2 : 0.15,
      shadowRadius: mode === 'screen' ? 10 : 8,
      elevation: mode === 'screen' ? 5 : 4,
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
      borderRadius: variables['--border-radius-medium'],
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
      borderRadius: variables['--border-radius-medium'],
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginLeft: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    linkBadgeText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    developmentCompanySection: {
      backgroundColor: variables['--card-background'],
      padding: 16,
      borderRadius: variables['--border-radius-large'],
      marginBottom: 24,
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
    developmentTeamHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 4
    },
    companyLogoContainer: {
      width: 56,
      height: 56,
      borderRadius: variables['--border-radius-medium'],
      backgroundColor: variables['--water'],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      overflow: 'hidden'
    },
    companyLogo: {
      width: '100%',
      height: '100%'
    },
    companyInfo: {
      flex: 1
    },
    companyName: {
      fontSize: 16,
      fontWeight: '700',
      color: variables['--text'],
      marginBottom: 2
    },
    teamSubtitle: {
      fontSize: 13,
      color: variables['--primary'],
      fontWeight: '600'
    },
    developersContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: variables['--border']
    },
    teamMembersTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: variables['--primary'],
      marginBottom: 12,
      textAlign: 'center'
    },
    developerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: variables['--surface-variant'],
      padding: 12,
      borderRadius: variables['--border-radius-medium'],
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: variables['--primary']
    },
    developerIcon: {
      width: 48,
      height: 48,
      borderRadius: variables['--border-radius-xlarge'],
      backgroundColor: variables['--primary'],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    },
    developerInfo: {
      flex: 1
    },
    developerName: {
      fontSize: 15,
      fontWeight: '700',
      color: variables['--text'],
      marginBottom: 2
    },
    developerRole: {
      fontSize: 12,
      color: variables['--primary'],
      fontWeight: '600',
      marginBottom: 2
    },
    developerDescription: {
      fontSize: 11,
      color: variables['--text-secondary'],
      fontStyle: 'italic'
    },
    creditsSection: {
      backgroundColor: variables['--surface-variant'],
      padding: 16,
      borderRadius: variables['--border-radius-medium'],
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
