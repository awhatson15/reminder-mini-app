import React, { useState } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { 
  NeuButton, 
  NeuCard, 
  NeuTextField, 
  NeuSwitch, 
  NeuIcon 
} from '../components/neumorphic';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';

/**
 * Пример использования неоморфных компонентов
 */
const NeuExample = () => {
  const [textValue, setTextValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <NeuCard variant="raised" sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Неоморфные компоненты
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Пример использования неоморфных компонентов в стиле skeuomorphism
        </Typography>

        {/* Кнопки */}
        <Typography variant="h6" gutterBottom>
          Кнопки (NeuButton)
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item>
            <NeuButton>Стандартная</NeuButton>
          </Grid>
          <Grid item>
            <NeuButton variant="flat">Плоская</NeuButton>
          </Grid>
          <Grid item>
            <NeuButton variant="inset">Вдавленная</NeuButton>
          </Grid>
          <Grid item>
            <NeuButton color="primary">Primary</NeuButton>
          </Grid>
          <Grid item>
            <NeuButton color="secondary">Secondary</NeuButton>
          </Grid>
          <Grid item>
            <NeuButton disabled>Отключена</NeuButton>
          </Grid>
          <Grid item>
            <NeuButton startIcon={<FavoriteIcon />}>С иконкой</NeuButton>
          </Grid>
        </Grid>

        {/* Карточки */}
        <Typography variant="h6" gutterBottom>
          Карточки (NeuCard)
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <NeuCard variant="raised" sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" gutterBottom>Выпуклая</Typography>
              <Typography variant="body2">
                Карточка с выступающим эффектом
              </Typography>
            </NeuCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <NeuCard variant="inset" sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" gutterBottom>Вдавленная</Typography>
              <Typography variant="body2">
                Карточка с эффектом углубления
              </Typography>
            </NeuCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <NeuCard variant="flat" clickable sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" gutterBottom>Кликабельная</Typography>
              <Typography variant="body2">
                С эффектами при наведении и нажатии
              </Typography>
            </NeuCard>
          </Grid>
        </Grid>

        {/* Текстовые поля */}
        <Typography variant="h6" gutterBottom>
          Текстовые поля (NeuTextField)
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <NeuTextField 
              label="Стандартное поле" 
              placeholder="Введите текст" 
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <NeuTextField 
              label="Вдавленное поле" 
              variant="inset"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              fullWidth
              startAdornment={<HomeIcon />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <NeuTextField 
              label="Многострочное поле" 
              multiline
              rows={3}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <NeuTextField 
              label="Отключенное поле" 
              placeholder="Нельзя редактировать"
              disabled
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Переключатели */}
        <Typography variant="h6" gutterBottom>
          Переключатели (NeuSwitch)
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <NeuSwitch 
              checked={switchValue}
              onChange={() => setSwitchValue(!switchValue)}
              label="Стандартный переключатель"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <NeuSwitch 
              checked={!switchValue}
              onChange={() => setSwitchValue(!switchValue)}
              label="С меткой слева"
              labelPosition="left"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <NeuSwitch 
              checked={switchValue}
              onChange={() => setSwitchValue(!switchValue)}
              label="Отключенный"
              disabled
            />
          </Grid>
        </Grid>
        
        {/* Иконки */}
        <Typography variant="h6" gutterBottom>
          Иконки (NeuIcon)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <NeuIcon 
            icon={<HomeIcon />} 
            variant="raised"
            clickable
          />
          <NeuIcon 
            icon={<SettingsIcon />} 
            variant="inset"
            clickable
          />
          <NeuIcon 
            icon={<FavoriteIcon />} 
            color="#e91e63"
            clickable
          />
          <NeuIcon 
            icon={<SettingsIcon />} 
            variant="flat"
            size="large"
            clickable
          />
          <NeuIcon 
            icon={<HomeIcon />} 
            size="small"
            clickable
          />
        </Box>
      </NeuCard>
    </Container>
  );
};

export default NeuExample;