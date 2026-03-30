import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';

import { TopicsTab } from './TopicsTab';
import { TopicForm } from './TopicForm';

export interface TopicData {
  id: string;
  nameHr: string;
  nameRu: string;
  nameUk: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
  exerciseTypes: string[];
  rulesHtml: string | null;
  createdAt: string;
}

export function TopicsPage() {
  const [tab, setTab] = useState(0);
  const [editingTopic, setEditingTopic] = useState<TopicData | null>(null);

  const handleEdit = (topic: TopicData) => {
    setEditingTopic(topic);
    setTab(1);
  };

  const handleFormDone = () => {
    setEditingTopic(null);
    setTab(0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Exercise Topics
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            if (v === 0) setEditingTopic(null);
          }}
        >
          <Tab label="Topics" />
          <Tab label={editingTopic ? 'Edit Topic' : 'Create Topic'} />
        </Tabs>
      </Box>
      {tab === 0 && <TopicsTab onEdit={handleEdit} />}
      {tab === 1 && <TopicForm topic={editingTopic} onDone={handleFormDone} />}
    </Box>
  );
}
