import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Switch,
  FormControlLabel,
  Stack,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseType } from '@cro/shared';

import { apiClient } from '../../api/client';
import { SingularPluralTab } from './SingularPluralTab';
import { FlashcardsTab } from './FlashcardsTab';
import { FillInBlankTab } from './FillInBlankTab';

interface TopicDetail {
  id: string;
  nameHr: string;
  nameEn: string;
  exerciseTypes: string[];
}

const EXERCISE_TABS = [
  { type: ExerciseType.TYPE_THE_ANSWER, label: 'Type the Answer' },
  { type: ExerciseType.FLASHCARDS, label: 'Flashcards' },
  { type: ExerciseType.FILL_IN_BLANK, label: 'Fill in Blank' },
];

export function ExerciseItemsPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);

  const {
    data: topic,
    isLoading,
    error,
  } = useQuery<TopicDetail>({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/topics`);
      return data.find((t: TopicDetail) => t.id === topicId);
    },
    enabled: !!topicId,
  });

  const toggleTypeMutation = useMutation({
    mutationFn: async ({ exerciseType, enabled }: { exerciseType: string; enabled: boolean }) => {
      await apiClient.patch(`/admin/topics/${topicId}/exercise-types`, {
        configs: [{ exerciseType, enabled }],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !topic) {
    return <Alert severity="error">Failed to load topic</Alert>;
  }

  const currentTab = EXERCISE_TABS[tab];

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/topics')} sx={{ mb: 2 }}>
        Back to Topics
      </Button>

      <Typography variant="h5" gutterBottom>
        {topic.nameEn} — Exercise Items
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {EXERCISE_TABS.map((et) => (
          <FormControlLabel
            key={et.type}
            control={
              <Switch
                checked={topic.exerciseTypes.includes(et.type)}
                onChange={(_, checked) =>
                  toggleTypeMutation.mutate({ exerciseType: et.type, enabled: checked })
                }
                disabled={toggleTypeMutation.isPending}
                size="small"
              />
            }
            label={et.label}
          />
        ))}
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {EXERCISE_TABS.map((et) => (
            <Tab key={et.type} label={et.label} />
          ))}
        </Tabs>
      </Box>

      {currentTab.type === ExerciseType.TYPE_THE_ANSWER && <SingularPluralTab topicId={topicId!} />}
      {currentTab.type === ExerciseType.FLASHCARDS && <FlashcardsTab topicId={topicId!} />}
      {currentTab.type === ExerciseType.FILL_IN_BLANK && <FillInBlankTab topicId={topicId!} />}
    </Box>
  );
}
