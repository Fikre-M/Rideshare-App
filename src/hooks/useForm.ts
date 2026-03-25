// @ts-nocheck
import { useState, useCallback, useEffect } from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for form handling with validation
 * @param {Object} options - Form options
 * @param {Object} options.defaultValues - Default form values
 * @param {Object|Function} options.validationSchema - Zod validation schema or function that returns a schema
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Function} [options.onError] - Error handler
 * @param {boolean} [options.resetOnSubmit=true] - Whether to reset the form after successful submission
 * @param {boolean} [options.showToastOnError=true] - Whether to show toast messages for validation errors
 * @returns {Object} Form methods and state
 */
const useForm = ({
  defaultValues = {},
  validationSchema,
  onSubmit,
  onError,
  resetOnSubmit = true,
  showToastOnError = true,
} = {}) => {
  // Initialize form with react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid, isSubmitSuccessful },
    reset,
    setError: setFieldError,
    setValue,
    getValues,
    watch,
    trigger,
    ...formMethods
  } = useReactHookForm({
    defaultValues,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    mode: 'onChange',
  });

  // Form submission state
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when defaultValues change
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (data, event) => {
      setIsLoading(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        // Execute the submit handler if provided
        if (onSubmit) {
          await onSubmit(data, { reset, setFieldError, event });
        }

        // Reset form after successful submission if enabled
        if (resetOnSubmit) {
          reset(defaultValues);
        }

        setSubmitSuccess(true);
        return true;
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Set form error
        const errorMessage = error.message || 'An error occurred while submitting the form';
        setSubmitError(errorMessage);
        
        // Show error toast if enabled
        if (showToastOnError) {
          toast.error(errorMessage);
        }
        
        // Call the error handler if provided
        if (onError) {
          onError(error, { reset, setFieldError });
        }
        
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultValues, onError, onSubmit, reset, resetOnSubmit, showToastOnError]
  );

  // Get field error message
  const getFieldError = useCallback(
    (fieldName) => {
      if (!errors[fieldName]) return null;
      
      const error = errors[fieldName];
      return error.message || 'This field is invalid';
    },
    [errors]
  );

  // Check if a field has an error
  const hasError = useCallback(
    (fieldName) => {
      return !!errors[fieldName];
    },
    [errors]
  );

  // Set a field value and optionally validate it
  const setFieldValue = useCallback(
    async (fieldName, value, shouldValidate = true) => {
      setValue(fieldName, value, { shouldDirty: true, shouldTouch: true });
      
      if (shouldValidate) {
        await trigger(fieldName);
      }
    },
    [setValue, trigger]
  );

  // Reset the form to default values
  const resetForm = useCallback(() => {
    reset(defaultValues);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [defaultValues, reset]);

  return {
    // Form state
    control,
    errors,
    isSubmitting: isSubmitting || isLoading,
    isDirty,
    isValid,
    isSubmitSuccessful,
    submitError,
    submitSuccess,
    isLoading,
    
    // Form methods
    handleSubmit: handleSubmit(handleFormSubmit),
    setFieldError,
    setFieldValue,
    getValues,
    watch,
    reset: resetForm,
    trigger,
    
    // Helper methods
    getFieldError,
    hasError,
    
    // Raw form methods from react-hook-form
    ...formMethods,
  };
};

export default useForm;
