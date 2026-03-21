import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';

import { CategoriesTab } from './CategoriesTab';
import { CategoryForm } from './CategoryForm';

export interface CategoryData {
  id: string;
  nameHr: string;
  nameRu: string;
  nameUk: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function CategoriesPage() {
  const [tab, setTab] = useState(0);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  const handleEdit = (category: CategoryData) => {
    setEditingCategory(category);
    setTab(1);
  };

  const handleFormDone = () => {
    setEditingCategory(null);
    setTab(0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Categories
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            if (v === 0) setEditingCategory(null);
          }}
        >
          <Tab label="Categories" />
          <Tab label={editingCategory ? 'Edit Category' : 'Create Category'} />
        </Tabs>
      </Box>
      {tab === 0 && <CategoriesTab onEdit={handleEdit} />}
      {tab === 1 && <CategoryForm category={editingCategory} onDone={handleFormDone} />}
    </Box>
  );
}
