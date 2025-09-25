import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  variables: Record<string, string>;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  variables
}) => {
  const styles = useMemo(() => createStyles(variables), [variables]);

  const renderStep = (stepNumber: number) => {
    const isActive = stepNumber === currentStep;
    const isCompleted = stepNumber < currentStep;

    return (
      <View key={stepNumber} style={styles.stepContainer}>
        <View
          style={[
            styles.stepCircle,
            isActive && styles.activeStep,
            isCompleted && styles.completedStep
          ]}
        >
          <Text
            style={[
              styles.stepNumber,
              isActive && styles.activeStepText,
              isCompleted && styles.completedStepText
            ]}
          >
            {isCompleted ? '✓' : stepNumber}
          </Text>
        </View>

        {stepNumber < totalSteps && (
          <View
            style={[styles.stepLine, isCompleted && styles.completedLine]}
          />
        )}
      </View>
    );
  };

  const getStepLabel = (step: number) => {
    switch (step) {
      case 1:
        return 'Personal';
      case 2:
        return 'Demografía';
      case 3:
        return 'Credenciales';
      default:
        return `Paso ${step}`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }, (_, index) =>
          renderStep(index + 1)
        )}
      </View>

      <View style={styles.labelsRow}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;

          return (
            <Text
              key={stepNumber}
              style={[styles.stepLabel, isActive && styles.activeLabel]}
            >
              {getStepLabel(stepNumber)}
            </Text>
          );
        })}
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground} />
        <View
          style={[
            styles.progressBar,
            { width: `${(currentStep / totalSteps) * 100}%` }
          ]}
        />
      </View>
    </View>
  );
};

const createStyles = (variables: Record<string, string>) =>
  StyleSheet.create({
    container: {
      marginBottom: 24,
      paddingHorizontal: 8
    },
    stepsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    },
    stepContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    stepCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: variables['--surface-variant'] || '#EEEEEE',
      borderWidth: 2,
      borderColor: variables['--border'] || '#E0E0E0',
      justifyContent: 'center',
      alignItems: 'center'
    },
    activeStep: {
      backgroundColor: variables['--primary'] || '#007A33',
      borderColor: variables['--primary'] || '#007A33'
    },
    completedStep: {
      backgroundColor: variables['--success'] || '#388E3C',
      borderColor: variables['--success'] || '#388E3C'
    },
    stepNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: variables['--text-secondary'] || '#616161'
    },
    activeStepText: {
      color: '#FFFFFF'
    },
    completedStepText: {
      color: '#FFFFFF',
      fontSize: 12
    },
    stepLine: {
      flex: 1,
      height: 2,
      backgroundColor: variables['--border'] || '#E0E0E0',
      marginHorizontal: 8
    },
    completedLine: {
      backgroundColor: variables['--success'] || '#388E3C'
    },
    labelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16
    },
    stepLabel: {
      fontSize: 12,
      color: variables['--text-secondary'] || '#616161',
      textAlign: 'center',
      flex: 1
    },
    activeLabel: {
      color: variables['--primary'] || '#007A33',
      fontWeight: '600'
    },
    progressBarContainer: {
      position: 'relative',
      height: 4,
      marginTop: 8
    },
    progressBarBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: variables['--border'] || '#E0E0E0',
      borderRadius: 2
    },
    progressBar: {
      height: 4,
      backgroundColor: variables['--primary'] || '#007A33',
      borderRadius: 2
    }
  });

export default React.memo(StepIndicator);
