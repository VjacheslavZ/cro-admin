import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';

import { WordsTab } from './WordsTab';
import { WordForm } from './WordForm';

export interface ExerciseConfig {
  exerciseType: string;
  enabled: boolean;
}

export interface WordData {
  id: string;
  wordSetId: string;
  baseForm: string;
  pluralForm: string | null;
  translationRu: string;
  translationUk: string;
  translationEn: string;
  sentenceHr: string | null;
  sentenceBlankAnswer: string | null;
  wrongOptions: string[] | null;
  sortOrder: number;
  exerciseConfigs?: ExerciseConfig[];
  createdAt: string;
}

export function WordsPage() {
  const [tab, setTab] = useState(0);
  const [editingWord, setEditingWord] = useState<WordData | null>(null);

  const handleEdit = (word: WordData) => {
    setEditingWord(word);
    setTab(1);
  };

  const handleFormDone = () => {
    setEditingWord(null);
    setTab(0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Words
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            if (v === 0) setEditingWord(null);
          }}
        >
          <Tab label="Words" />
          <Tab label={editingWord ? 'Edit Word' : 'Create Word'} />
        </Tabs>
      </Box>
      {tab === 0 && <WordsTab onEdit={handleEdit} />}
      {tab === 1 && <WordForm word={editingWord} onDone={handleFormDone} />}
    </Box>
  );
}
