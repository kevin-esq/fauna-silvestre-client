import { useCallback, useEffect, useState } from 'react';
import { catalogService } from '@/services/catalog/catalog.service';
import {
  AnimalModelResponse,
  CreateAnimalRequest,
  UpdateAnimalRequest,
  AnimalCrudResponse
} from '@/domain/models/animal.models';

interface AnimalFormData {
  specie: string;
  commonNoun: string;
  description: string;
  habits: string;
  habitat: string;
  reproduction: string;
  distribution: string;
  feeding: string;
  category: string;
  image: string;
}

interface AnimalFormState {
  formData: AnimalFormData;
  isLoading: boolean;
  isSaving: boolean;
  errors: Partial<AnimalFormData>;
  isValid: boolean;
}

interface AnimalFormActions {
  updateField: (field: keyof AnimalFormData, value: string) => void;
  validateForm: () => boolean;
  saveAnimal: () => Promise<AnimalCrudResponse | null>;
  resetForm: () => void;
  loadAnimal: (animal: AnimalModelResponse) => void;
  clearErrors: () => void;
}

interface AnimalFormReturn {
  state: AnimalFormState;
  actions: AnimalFormActions;
  isEditMode: boolean;
}

const INITIAL_FORM_DATA: AnimalFormData = {
  specie: '',
  commonNoun: '',
  description: '',
  habits: '',
  habitat: '',
  reproduction: '',
  distribution: '',
  feeding: '',
  category: '',
  image: ''
};

const VALIDATION_RULES = {
  specie: { required: true, minLength: 3, maxLength: 100 },
  commonNoun: { required: true, minLength: 2, maxLength: 50 },
  description: { required: true, minLength: 10, maxLength: 1000 },
  habits: { required: true, minLength: 10, maxLength: 500 },
  habitat: { required: true, minLength: 10, maxLength: 500 },
  reproduction: { required: true, minLength: 10, maxLength: 500 },
  distribution: { required: true, minLength: 10, maxLength: 500 },
  feeding: { required: true, minLength: 10, maxLength: 500 },
  category: { required: true, minLength: 2, maxLength: 30 },
  image: { required: true, minLength: 100, maxLength: 10000000 }
} as const;

export const useAnimalForm = (
  initialAnimal?: AnimalModelResponse | undefined
): AnimalFormReturn => {
  const [editingAnimal, setEditingAnimal] =
    useState<AnimalModelResponse | null>(initialAnimal || null);

  const [state, setState] = useState<AnimalFormState>({
    formData: INITIAL_FORM_DATA,
    isLoading: false,
    isSaving: false,
    errors: {},
    isValid: false
  });

  const validateField = useCallback(
    (field: keyof AnimalFormData, value: string): string | null => {
      if (field === 'image' && editingAnimal) {
        return null;
      }

      const rules = VALIDATION_RULES[field];

      if (rules.required && !value.trim()) {
        return `${getFieldLabel(field)} es requerido`;
      }

      if (
        value.trim() &&
        rules.minLength &&
        value.trim().length < rules.minLength
      ) {
        return `${getFieldLabel(field)} debe tener al menos ${rules.minLength} caracteres`;
      }

      if (
        value.trim() &&
        rules.maxLength !== undefined &&
        value.trim().length > rules.maxLength
      ) {
        return `${getFieldLabel(field)} no puede exceder ${rules.maxLength} caracteres`;
      }

      if (field === 'image' && value.trim() && !isValidBase64Image(value)) {
        return 'La imagen debe ser un formato válido (base64)';
      }

      return null;
    },
    [editingAnimal]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<AnimalFormData> = {};
    let isValid = true;
    const currentFormData = state.formData;
    const fieldsToValidate = (
      Object.keys(VALIDATION_RULES) as Array<keyof AnimalFormData>
    ).filter(field => {
      if (field === 'image' && editingAnimal) {
        return false;
      }
      return true;
    });

    fieldsToValidate.forEach(field => {
      const fieldValue = currentFormData[field];
      const error = validateField(field, fieldValue);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setState(prev => ({
      ...prev,
      errors: newErrors,
      isValid
    }));

    return isValid;
  }, [validateField, editingAnimal, state.formData]);

  const updateField = useCallback(
    (field: keyof AnimalFormData, value: string) => {
      setState(prev => {
        const newFormData = { ...prev.formData, [field]: value };
        const fieldError = validateField(field, value);
        const newErrors = { ...prev.errors };

        if (fieldError) {
          newErrors[field] = fieldError;
        } else {
          delete newErrors[field];
        }

        const hasErrors = Object.keys(newErrors).length > 0;

        const requiredFields = (
          Object.keys(VALIDATION_RULES) as Array<keyof AnimalFormData>
        ).filter(requiredField => {
          if (requiredField === 'image' && editingAnimal) {
            return false;
          }
          return true;
        });

        const allRequiredFieldsFilled = requiredFields.every(requiredField => {
          const fieldValue =
            requiredField === field ? value : newFormData[requiredField];
          return fieldValue.trim() !== '';
        });

        return {
          ...prev,
          formData: newFormData,
          errors: newErrors,
          isValid: !hasErrors && allRequiredFieldsFilled
        };
      });
    },
    [validateField, editingAnimal]
  );

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: INITIAL_FORM_DATA,
      errors: {},
      isValid: false
    }));
    setEditingAnimal(null);
  }, []);

  const saveAnimal =
    useCallback(async (): Promise<AnimalCrudResponse | null> => {
      const isFormValid = validateForm();

      if (!isFormValid) {
        return {
          error: true,
          message: 'Por favor, corrige los errores en el formulario'
        };
      }

      const currentEditingAnimal: AnimalModelResponse | null = editingAnimal;

      setState(prev => ({ ...prev, isSaving: true }));

      try {
        const response: AnimalCrudResponse = await (currentEditingAnimal
          ? catalogService.updateCatalog({
              catalogId: currentEditingAnimal.catalogId,
              ...state.formData
            } as UpdateAnimalRequest)
          : catalogService.createCatalog(
              state.formData as CreateAnimalRequest
            ));

        if (!response.error) {
          resetForm();
        }

        return response;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error inesperado al guardar el animal';
        return { error: true, message: errorMessage };
      } finally {
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, [editingAnimal, state, validateForm, resetForm]);

  const loadAnimal = useCallback((animal: AnimalModelResponse) => {
    setEditingAnimal(animal);
    setState(prev => ({
      ...prev,
      formData: {
        specie: animal.specie,
        commonNoun: animal.commonNoun,
        description: animal.description,
        habits: animal.habits,
        habitat: animal.habitat,
        reproduction: animal.reproduction,
        distribution: animal.distribution,
        feeding: animal.feeding,
        category: animal.category,
        image: animal.image
      },
      errors: {},
      isValid: true
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);
  useEffect(() => {
    if (initialAnimal) {
      loadAnimal(initialAnimal);
    }
  }, [initialAnimal, loadAnimal]);

  const actions: AnimalFormActions = {
    updateField,
    validateForm,
    saveAnimal,
    resetForm,
    loadAnimal,
    clearErrors
  };

  return {
    state,
    actions,
    isEditMode: !!editingAnimal
  };
};

const getFieldLabel = (field: keyof AnimalFormData): string => {
  const labels: Record<keyof AnimalFormData, string> = {
    specie: 'Especie',
    commonNoun: 'Nombre común',
    description: 'Descripción',
    habits: 'Hábitos',
    habitat: 'Hábitat',
    reproduction: 'Reproducción',
    distribution: 'Distribución',
    feeding: 'Alimentación',
    category: 'Clase',
    image: 'Imagen'
  };
  return labels[field];
};

const isValidBase64Image = (base64: string): boolean => {
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Regex.test(base64) || base64.length > 100;
};
