import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking
} from 'react-native';

interface SponsorData {
  name: string;
  role: string;
  website?: string;
  color?: string;
}

interface SponsorsFooterProps {
  variables: Record<string, string>;
}

const SponsorsFooter: React.FC<SponsorsFooterProps> = ({ variables }) => {
  const styles = useMemo(() => createStyles(variables), [variables]);

  const sponsors: SponsorData[] = [
    {
      name: 'EcoTech Solutions',
      role: 'Desarrollo Tecnológico',
      website: 'https://ecotech.example.com',
      color: variables['--forest']
    },
    {
      name: 'Green Innovation Lab',
      role: 'Investigación & Desarrollo',
      website: 'https://greenlab.example.com',
      color: variables['--leaf']
    },
    {
      name: 'Sustainable Future Corp',
      role: 'Financiamiento',
      color: variables['--water']
    },
    {
      name: 'Nature Conservation Alliance',
      role: 'Consultoría Ambiental',
      color: variables['--earth']
    }
  ];

  const handleSponsorPress = async (website?: string) => {
    if (website) {
      try {
        const supported = await Linking.canOpenURL(website);
        if (supported) {
          await Linking.openURL(website);
        }
      } catch (error) {
        console.log('Error opening URL:', error);
      }
    }
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.divider} />

      <Text style={styles.footerTitle}>Apoyado por</Text>

      <View style={styles.sponsorsGrid}>
        {sponsors.map((sponsor, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sponsorCard,
              { borderLeftColor: sponsor.color || variables['--primary'] }
            ]}
            onPress={() => handleSponsorPress(sponsor.website)}
            disabled={!sponsor.website}
            activeOpacity={sponsor.website ? 0.7 : 1}
          >
            <View style={styles.sponsorContent}>
              <Text style={styles.sponsorName}>{sponsor.name}</Text>
              <Text style={styles.sponsorRole}>{sponsor.role}</Text>
            </View>
            {sponsor.website && (
              <View style={styles.linkIndicator}>
                <Text style={styles.linkText}>🔗</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.creditsSection}>
        <Text style={styles.creditsTitle}>Colaboradores</Text>
        <Text style={styles.creditsText}>
          Esta aplicación es posible gracias a la colaboración de empresas
          comprometidas con la sostenibilidad y la innovación tecnológica.
        </Text>
      </View>

      <View style={styles.copyrightSection}>
        <Text style={styles.copyrightText}>© 2024 EcoApp - Versión 1.0.0</Text>
        <Text style={styles.poweredByText}>Powered by React Native 🌱</Text>
      </View>
    </View>
  );
};

const createStyles = (variables: Record<string, string>) =>
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
      borderRadius: 12,
      borderLeftWidth: 4,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: variables['--shadow'],
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    sponsorContent: {
      flex: 1
    },
    sponsorName: {
      fontSize: 16,
      fontWeight: '600',
      color: variables['--text'],
      marginBottom: 4
    },
    sponsorRole: {
      fontSize: 13,
      color: variables['--text-secondary'],
      fontStyle: 'italic'
    },
    linkIndicator: {
      paddingLeft: 12
    },
    linkText: {
      fontSize: 14,
      opacity: 0.6
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
