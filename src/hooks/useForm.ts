import { useState, useCallback, useEffect } from 'react';
import { useForm as useReactHookForm, FieldValues, DefaultValues, Path, UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { ZodSchema } from 'zod';

interface UseFormOptions<T extends FieldValues> {
  defaultValues?: DefaultValues<T>;
  validationSchema?: ZodSchema<T>;
  onSubmit?: (data: T, helpers: { reset: () => void; setFieldError: UseFormSetError<T>; event?: React.BaseSyntheticEvent }) => Promise<void> | void;
  onError?: (error: Error, helpers: { reset: () => void; setFieldError: UseFormSetError<T> }) => void;
  resetOnSubmit?: boolean;
  showToastOnError?: boolean;
}

const useForm = <T extends FieldValues = FieldValues>({
  defaultValues = {} as DefaultValues<T>,
  validationSchema,
  onSubmit,
  onError,
  resetOnSubmit = true,
  showToastOnError = true,
}: UseFormOptions<T> = {}) => {
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
  } = useReactHookForm<T>({
    defaultValues,
    resolver: validationSchema ? zodResolver(validationSchema as any) : undefined,
    mode: 'onChange',
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handleFormSubmit = useCallback(
    async (data: T, event?: React.BaseSyntheticEvent) => {
      setIsLoading(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        if (onSubmit) {
          await onSubmit(data, { reset: () => reset(defaultValues), setFieldError, event });
        }
        if (resetOnSubmit) reset(defaultValues);
        setSubmitSuccess(true);
        return true;
      } catch (error) {
        console.error('Form submission error:', error);
        const errorMessage = (error as Error).message || 'An error occurred while submitting the form';
        setSubmitError(errorMessage);
        if (showToastOnError) toast.error(errorMessage);
        if (onError) onError(error as Error, { reset: () => reset(defaultValues), setFieldError });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultValues, onError, onSubmit, reset, resetOnSubmit, showToastOnError, setFieldError]
  );

  const getFieldError = useCallback(
    (fieldName: Path<T>): string | null => {
      if (!errors[fieldName]) return null;
      const error = errors[fieldName] as { message?: string };
      return error.message || 'This field is invalid';
    },
    [errors]
  );

  const hasError = useCallback(
    (fieldName: Path<T>): boolean => !!errors[fieldName],
    [errors]
  );

  const setFieldValue = useCallback(
    async (fieldName: Path<T>, value: unknown, shouldValidate = true) => {
      setValue(fieldName, value as any, { shouldDirty: true, shouldTouch: true });
      if (shouldValidate) await trigger(fieldName);
    },
    [setValue, trigger]
  );

  const resetForm = useCallback(() => {
    reset(defaultValues);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [defaultValues, reset]);

  return {
    control,
    errors,
    isSubmitting: isSubmitting || isLoading,
    isDirty,
    isValid,
    isSubmitSuccessful,
    submitError,
    submitSuccess,
    isLoading,
    handleSubmit: handleSubmit(handleFormSubmit as any),
    setFieldError,
    setFieldValue,
    getValues,
    watch,
    reset: resetForm,
    trigger,
    getFieldError,
    hasError,
    ...formMethods,
  };
};

export default useForm;
