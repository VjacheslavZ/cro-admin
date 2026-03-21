import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';

import { WordSetsTab } from './WordSetsTab';
import { WordSetForm } from './WordSetForm';

export interface WordSetData {
  id: string;
  categoryId: string;
  nameHr: string;
  nameRu: string;
  nameUk: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { words: number };
  createdAt: string;
}

export function WordSetsPage() {
  const [tab, setTab] = useState(0);
  const [editingWordSet, setEditingWordSet] = useState<WordSetData | null>(null);

  const handleEdit = (wordSet: WordSetData) => {
    setEditingWordSet(wordSet);
    setTab(1);
  };

  const handleFormDone = () => {
    setEditingWordSet(null);
    setTab(0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Word Sets
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            if (v === 0) setEditingWordSet(null);
          }}
        >
          <Tab label="Word Sets" />
          <Tab label={editingWordSet ? 'Edit Word Set' : 'Create Word Set'} />
        </Tabs>
      </Box>
      {tab === 0 && <WordSetsTab onEdit={handleEdit} />}
      {tab === 1 && <WordSetForm wordSet={editingWordSet} onDone={handleFormDone} />}
    </Box>
  );
}
