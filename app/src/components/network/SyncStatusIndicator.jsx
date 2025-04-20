import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Badge, Tooltip, CircularProgress } from '@mui/material';
import { WifiOff, Sync, CloudDone, CloudOff, CloudSync } from '@mui/icons-material';
import reminderService from '../../services/reminderService';

// Стили
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '16px',
    margin: '4px',
    fontSize: '14px',
  },
  online: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    color: '#2e7d32',
  },
  offline: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    color: '#d32f2f',
  },
  syncing: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    color: '#1976d2',
  },
  pending: {
    backgroundColor: 'rgba(245, 124, 0, 0.1)',
    color: '#f57c00',
  },
  icon: {
    fontSize: '16px',
    marginRight: '4px',
  },
  syncButton: {
    minWidth: 'auto',
    padding: '2px',
    marginLeft: '4px',
  },
  progress: {
    width: '14px !important',
    height: '14px !important',
    marginRight: '6px',
  },
};

// Форматирование времени последней синхронизации
const formatLastSync = (lastSyncTime) => {
  if (!lastSyncTime) return 'Никогда';
  
  const lastSync = new Date(lastSyncTime);
  const now = new Date();
  const diffMs = now - lastSync;
  
  // Если синхронизация была менее минуты назад
  if (diffMs < 60000) {
    return 'Только что';
  }
  
  // Если синхронизация была менее часа назад
  if (diffMs < 3600000) {
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes} мин. назад`;
  }
  
  // Если синхронизация была сегодня
  if (lastSync.toDateString() === now.toDateString()) {
    return `Сегодня в ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Если синхронизация была вчера
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastSync.toDateString() === yesterday.toDateString()) {
    return `Вчера в ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // В остальных случаях показываем дату и время
  return lastSync.toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const SyncStatusIndicator = () => {
  // Состояния компонента
  const [status, setStatus] = useState({
    online: navigator.onLine,
    pendingCount: 0,
    lastSync: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastCheck, setLastCheck] = useState(Date.now());
  
  // Получение статуса синхронизации
  const checkSyncStatus = async () => {
    try {
      const syncStatus = await reminderService.getSyncStatus();
      setStatus(syncStatus);
    } catch (error) {
      console.error('Ошибка при получении статуса синхронизации:', error);
    }
    
    setLastCheck(Date.now());
  };
  
  // Принудительная синхронизация
  const handleSync = async () => {
    if (!status.online || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      await reminderService.syncNow();
      await checkSyncStatus();
    } catch (error) {
      console.error('Ошибка при синхронизации:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Обработка изменения статуса сети
  const handleNetworkChange = () => {
    checkSyncStatus();
  };
  
  // Инициализация и настройка интервала проверки
  useEffect(() => {
    // Проверяем статус при монтировании компонента
    checkSyncStatus();
    
    // Настраиваем слушатели событий сети
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // Настраиваем интервал для периодической проверки
    const intervalId = setInterval(checkSyncStatus, 30000); // Проверка каждые 30 секунд
    
    // Очистка при размонтировании
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      clearInterval(intervalId);
    };
  }, []);
  
  // Определяем текущий статус для отображения
  let currentStatus = 'online';
  let statusText = 'Онлайн';
  let StatusIcon = CloudDone;
  
  if (!status.online) {
    currentStatus = 'offline';
    statusText = 'Офлайн';
    StatusIcon = WifiOff;
  } else if (isSyncing) {
    currentStatus = 'syncing';
    statusText = 'Синхронизация...';
    StatusIcon = CloudSync;
  } else if (status.pendingCount > 0) {
    currentStatus = 'pending';
    statusText = `Ожидает (${status.pendingCount})`;
    StatusIcon = CloudSync;
  }
  
  // Формируем текст для всплывающей подсказки
  const tooltipText = `
    Статус: ${status.online ? 'Подключен к сети' : 'Нет подключения'}
    ${status.pendingCount > 0 ? `Ожидает синхронизации: ${status.pendingCount}` : ''}
    Последняя синхронизация: ${formatLastSync(status.lastSync)}
    Последняя проверка: ${new Date(lastCheck).toLocaleTimeString()}
  `;
  
  return (
    <Tooltip title={tooltipText} arrow placement="bottom">
      <Box
        sx={{
          ...styles.container,
          ...(styles[currentStatus] || styles.online),
          cursor: 'pointer',
        }}
      >
        {isSyncing ? (
          <CircularProgress sx={styles.progress} color="inherit" />
        ) : (
          <StatusIcon sx={styles.icon} />
        )}
        
        <Typography variant="caption" component="span">
          {statusText}
        </Typography>
        
        {status.online && status.pendingCount > 0 && !isSyncing && (
          <Button
            sx={styles.syncButton}
            size="small"
            onClick={handleSync}
            color="inherit"
          >
            <Sync fontSize="small" />
          </Button>
        )}
      </Box>
    </Tooltip>
  );
};

export default SyncStatusIndicator; 