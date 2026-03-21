import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  Divider,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseType } from '@cro/shared';

import { apiClient } from '../../api/client';
import type { CategoryData } from '../categories/CategoriesPage';
import type { WordSetData } from '../word-sets/WordSetsPage';
import type { WordData } from './WordsPage';

const wordSchema = z.object({
  wordSetId: z.string().min(1, 'Word set is required'),
  baseForm: z.string().min(1, 'Base form is required'),
  pluralForm: z.string().optional().default(''),
  translationRu: z.string().min(1, 'Translation (RU) is required'),
  translationUk: z.string().min(1, 'Translation (UK) is required'),
  translationEn: z.string().min(1, 'Translation (EN) is required'),
  sortOrder: z.coerce.number().int().min(0, 'Sort order must be >= 0'),
  enableJedninaMnozina: z.boolean(),
  enableFlashcards: z.boolean(),
});

type WordFormData = z.infer<typeof wordSchema>;

function getAxiosErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }
  return 'An error occurred';
}

function hasConfig(word: WordData | null, type: string): boolean {
  return word?.exerciseConfigs?.some((c) => c.exerciseType === type && c.enabled) ?? false;
}

interface WordFormProps {
  word: WordData | null;
  onDone: () => void;
}

export function WordForm({ word, onDone }: WordFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const isEditing = !!word;

  const { data: categories } = useQuery<CategoryData[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/categories');
      return data;
    },
  });

  const { data: wordSets } = useQuery<WordSetData[]>({
    queryKey: ['word-sets', categoryFilter],
    queryFn: async () => {
      const params = categoryFilter ? { categoryId: categoryFilter } : {};
      const { data } = await apiClient.get('/admin/word-sets', { params });
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<WordFormData>({
    resolver: zodResolver(wordSchema),
    defaultValues: word
      ? {
          wordSetId: word.wordSetId,
          baseForm: word.baseForm,
          pluralForm: word.pluralForm ?? '',
          translationRu: word.translationRu,
          translationUk: word.translationUk,
          translationEn: word.translationEn,
          sortOrder: word.sortOrder,
          enableJedninaMnozina: hasConfig(word, ExerciseType.JEDNINA_MNOZINA),
          enableFlashcards: hasConfig(word, ExerciseType.FLASHCARDS),
        }
      : {
          wordSetId: '',
          baseForm: '',
          pluralForm: '',
          translationRu: '',
          translationUk: '',
          translationEn: '',
          sortOrder: 0,
          enableJedninaMnozina: false,
          enableFlashcards: false,
        },
  });

  const watchedBaseForm = useWatch({ control, name: 'baseForm' });
  const watchedPluralForm = useWatch({ control, name: 'pluralForm' });
  const watchedTranslationRu = useWatch({ control, name: 'translationRu' });
  const watchedTranslationUk = useWatch({ control, name: 'translationUk' });
  const watchedTranslationEn = useWatch({ control, name: 'translationEn' });
  const watchedEnableJM = useWatch({ control, name: 'enableJedninaMnozina' });

  const mutation = useMutation({
    mutationFn: async (data: WordFormData) => {
      const wordPayload = {
        wordSetId: data.wordSetId,
        baseForm: data.baseForm,
        pluralForm: data.pluralForm || null,
        translationRu: data.translationRu,
        translationUk: data.translationUk,
        translationEn: data.translationEn,
        sortOrder: data.sortOrder,
      };

      let savedWord: { id: string };
      if (isEditing) {
        const { data: result } = await apiClient.patch(`/admin/words/${word.id}`, wordPayload);
        savedWord = result;
      } else {
        const { data: result } = await apiClient.post('/admin/words', wordPayload);
        savedWord = result;
      }

      await apiClient.patch(`/admin/words/${savedWord.id}/exercise-configs`, {
        configs: [
          { exerciseType: ExerciseType.JEDNINA_MNOZINA, enabled: data.enableJedninaMnozina },
          { exerciseType: ExerciseType.FLASHCARDS, enabled: data.enableFlashcards },
        ],
      });

      return savedWord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
      setSuccess(true);
      setError(null);
      if (!isEditing) reset();
      setTimeout(() => onDone(), 1500);
    },
    onError: (err: unknown) => {
      setSuccess(false);
      setError(getAxiosErrorMessage(err));
    },
  });

  const onSubmit = (data: WordFormData) => {
    if (data.enableJedninaMnozina && !data.pluralForm) {
      setError('Fill in plural form to enable Jednina i Množina exercise type');
      return;
    }
    setError(null);
    setSuccess(false);
    mutation.mutate(data);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 700 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Word {isEditing ? 'updated' : 'created'} successfully
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Section 1: Base fields */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Base Fields
        </Typography>

        {!isEditing && (
          <FormControl sx={{ mb: 1, minWidth: 200 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Filter by Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {categories?.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Controller
          name="wordSetId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.wordSetId}>
              <InputLabel>Word Set</InputLabel>
              <Select {...field} label="Word Set">
                {wordSets?.map((ws) => (
                  <MenuItem key={ws.id} value={ws.id}>
                    {ws.nameEn}
                  </MenuItem>
                ))}
              </Select>
              {errors.wordSetId && <FormHelperText>{errors.wordSetId.message}</FormHelperText>}
            </FormControl>
          )}
        />
        <TextField
          {...register('baseForm')}
          label="Base Form (Croatian)"
          fullWidth
          margin="normal"
          error={!!errors.baseForm}
          helperText={errors.baseForm?.message}
        />
        <TextField
          {...register('translationRu')}
          label="Translation (RU)"
          fullWidth
          margin="normal"
          error={!!errors.translationRu}
          helperText={errors.translationRu?.message}
        />
        <TextField
          {...register('translationUk')}
          label="Translation (UK)"
          fullWidth
          margin="normal"
          error={!!errors.translationUk}
          helperText={errors.translationUk?.message}
        />
        <TextField
          {...register('translationEn')}
          label="Translation (EN)"
          fullWidth
          margin="normal"
          error={!!errors.translationEn}
          helperText={errors.translationEn?.message}
        />
        <TextField
          {...register('sortOrder')}
          label="Sort Order"
          type="number"
          fullWidth
          margin="normal"
          error={!!errors.sortOrder}
          helperText={errors.sortOrder?.message}
        />

        <Divider sx={{ my: 3 }} />

        {/* Section 2: Jednina i množina */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Jednina i množina
        </Typography>
        <TextField
          {...register('pluralForm')}
          label="Plural Form (Croatian)"
          fullWidth
          margin="normal"
        />
        {watchedBaseForm && watchedPluralForm && (
          <Card variant="outlined" sx={{ mt: 1, mb: 2, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Preview — Student sees: <strong>{watchedBaseForm}</strong> → enters:{' '}
                <strong>___</strong>. Correct answer: <strong>{watchedPluralForm}</strong>
              </Typography>
            </CardContent>
          </Card>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Section 3: Flashcards preview */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Flashcards
        </Typography>
        {watchedBaseForm && (
          <Card variant="outlined" sx={{ mt: 1, mb: 2, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Front: <strong>{watchedBaseForm}</strong> → Back:{' '}
                <strong>
                  {[watchedTranslationRu, watchedTranslationUk, watchedTranslationEn]
                    .filter(Boolean)
                    .join(' / ') || '(no translations yet)'}
                </strong>
              </Typography>
            </CardContent>
          </Card>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Section 4: Exercise type toggles */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Exercise Type Toggles
        </Typography>
        <Stack spacing={1}>
          <Controller
            name="enableJedninaMnozina"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Jednina i množina"
              />
            )}
          />
          {watchedEnableJM && !watchedPluralForm && (
            <Alert severity="warning" sx={{ py: 0 }}>
              Fill in plural form to enable this exercise type
            </Alert>
          )}
          <Controller
            name="enableFlashcards"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Flashcards"
              />
            )}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label="Multiple choice (Phase 3)"
            sx={{ opacity: 0.5 }}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label="Fill in the blank (Phase 3)"
            sx={{ opacity: 0.5 }}
          />
        </Stack>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={mutation.isPending}
          sx={{ mt: 3 }}
        >
          {mutation.isPending ? (
            <CircularProgress size={24} />
          ) : isEditing ? (
            'Update Word'
          ) : (
            'Create Word'
          )}
        </Button>
      </Box>
    </Paper>
  );
}
