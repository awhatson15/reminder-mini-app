import React, { useState, useEffect, useMemo } from 'react';
import { 
  List, 
  ListItem, 
  Checkbox, 
  Text, 
  Flex, 
  IconButton, 
  Badge, 
  Divider, 
  useToast, 
  Spinner, 
  Box,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  EditIcon, 
  TimeIcon, 
  CheckIcon,
  WarningIcon,
  RepeatIcon,
  InfoIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';
import { RiWifiOffLine } from 'react-icons/ri';
import { format, isToday, isTomorrow, isPast, isWithinInterval, addHours } from 'date-fns';
import { ru } from 'date-fns/locale';
import reminderService from '../services/reminderService';
import ReminderForm from './ReminderForm';
import EmptyState from './EmptyState';

const formatReminderDate = (date) => {
  const reminderDate = new Date(date);
  
  if (isToday(reminderDate)) {
    return `Сегодня, ${format(reminderDate, 'HH:mm')}`;
  } else if (isTomorrow(reminderDate)) {
    return `Завтра, ${format(reminderDate, 'HH:mm')}`;
  } else {
    return format(reminderDate, 'd MMMM, HH:mm', { locale: ru });
  }
};

const ReminderList = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'upcoming', 'overdue'
  const [syncStatus, setSyncStatus] = useState({ online: true, pendingCount: 0 });
  
  const toast = useToast();

  // Загрузка напоминаний
  const loadReminders = async (forceRefresh = false) => {
    setLoading(true);
    try {
      let loadedReminders;
      
      switch (filter) {
        case 'active':
          loadedReminders = await reminderService.getRemindersByStatus('active', forceRefresh);
          break;
        case 'completed':
          loadedReminders = await reminderService.getRemindersByStatus('completed', forceRefresh);
          break;
        case 'upcoming':
          loadedReminders = await reminderService.getUpcomingReminders(24, forceRefresh);
          break;
        case 'overdue':
          loadedReminders = await reminderService.getOverdueReminders(forceRefresh);
          break;
        default:
          loadedReminders = await reminderService.getReminders(forceRefresh);
      }
      
      setReminders(loadedReminders);
      setError(null);
      
      // Обновляем статус синхронизации
      const status = reminderService.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      setError('Не удалось загрузить напоминания');
      console.error('Ошибка при загрузке напоминаний:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при монтировании и изменении фильтра
  useEffect(() => {
    loadReminders();
    
    // Устанавливаем интервал для проверки статуса синхронизации
    const intervalId = setInterval(() => {
      const status = reminderService.getSyncStatus();
      setSyncStatus(status);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [filter]);

  // Принудительная синхронизация
  const handleSync = async () => {
    if (!syncStatus.online) {
      toast({
        title: 'Нет подключения к сети',
        description: 'Синхронизация будет выполнена автоматически при восстановлении соединения',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (syncStatus.pendingCount === 0) {
      toast({
        title: 'Нет изменений для синхронизации',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    try {
      toast({
        title: 'Синхронизация...',
        description: `Отправка ${syncStatus.pendingCount} изменений на сервер`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      
      await reminderService.syncNow();
      
      // Обновляем статус и список напоминаний
      const status = reminderService.getSyncStatus();
      setSyncStatus(status);
      
      toast({
        title: 'Синхронизация завершена',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Обновляем список напоминаний
      loadReminders(true);
    } catch (err) {
      toast({
        title: 'Ошибка синхронизации',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработка отметки о выполнении
  const handleToggleComplete = async (reminder) => {
    try {
      if (reminder.status === 'completed') {
        await reminderService.markAsActive(reminder._id);
      } else {
        await reminderService.markAsCompleted(reminder._id);
      }
      
      // Обновляем список напоминаний
      loadReminders();
      
      toast({
        title: reminder.status === 'completed' ? 'Напоминание активировано' : 'Напоминание выполнено',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Ошибка при изменении статуса',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработка удаления напоминания
  const handleDelete = async (id) => {
    try {
      await reminderService.deleteReminder(id);
      
      // Обновляем список напоминаний
      loadReminders();
      
      toast({
        title: 'Напоминание удалено',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Ошибка при удалении',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработка редактирования напоминания
  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
  };

  // Обработка сохранения изменений
  const handleSaveEdit = async (updatedReminder) => {
    try {
      await reminderService.updateReminder(editingReminder._id, updatedReminder);
      
      // Обновляем список напоминаний
      loadReminders();
      
      // Закрываем форму редактирования
      setEditingReminder(null);
      
      toast({
        title: 'Напоминание обновлено',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Ошибка при обновлении',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Закрытие формы редактирования
  const handleCancelEdit = () => {
    setEditingReminder(null);
  };

  // Мемоизированные отфильтрованные напоминания
  const sortedReminders = useMemo(() => {
    // Сначала сортируем по времени
    return [...reminders].sort((a, b) => {
      // Сортировка: сначала несделанные, потом по времени
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // Если оба одинакового статуса, сортируем по времени
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [reminders]);

  // Получение статусного бейджа для напоминания
  const getReminderStatusBadge = (reminder) => {
    const now = new Date();
    const reminderDate = new Date(reminder.dueDate);
    
    if (reminder.status === 'completed') {
      return (
        <Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>
          Выполнено
        </Badge>
      );
    }
    
    if (isPast(reminderDate)) {
      return (
        <Badge colorScheme="red" variant="solid" borderRadius="full" px={2}>
          Просрочено
        </Badge>
      );
    }
    
    if (isWithinInterval(reminderDate, { start: now, end: addHours(now, 1) })) {
      return (
        <Badge colorScheme="orange" variant="solid" borderRadius="full" px={2}>
          Скоро
        </Badge>
      );
    }
    
    if (isToday(reminderDate)) {
      return (
        <Badge colorScheme="blue" variant="solid" borderRadius="full" px={2}>
          Сегодня
        </Badge>
      );
    }
    
    if (isTomorrow(reminderDate)) {
      return (
        <Badge colorScheme="purple" variant="solid" borderRadius="full" px={2}>
          Завтра
        </Badge>
      );
    }
    
    return (
      <Badge colorScheme="gray" variant="solid" borderRadius="full" px={2}>
        Запланировано
      </Badge>
    );
  };

  // Рендер индикатора синхронизации
  const renderSyncIndicator = () => {
    return (
      <HStack spacing={2} color={syncStatus.online ? "green.500" : "red.500"}>
        {!syncStatus.online && <Icon as={RiWifiOffLine} />}
        {syncStatus.pendingCount > 0 && (
          <Badge colorScheme="yellow" variant="solid" borderRadius="full">
            {syncStatus.pendingCount}
          </Badge>
        )}
        <IconButton
          icon={<RepeatIcon />}
          size="sm"
          variant="ghost"
          isDisabled={!syncStatus.online || syncStatus.pendingCount === 0}
          onClick={handleSync}
          title="Синхронизировать изменения"
        />
      </HStack>
    );
  };

  if (loading && reminders.length === 0) {
    return (
      <Flex justify="center" align="center" height="200px" direction="column">
        <Spinner size="lg" color="blue.500" mb={4} />
        <Text>Загрузка напоминаний...</Text>
      </Flex>
    );
  }

  if (error && reminders.length === 0) {
    return (
      <Alert status="error" borderRadius="md" mb={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Заголовок и фильтры */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb={4} 
        wrap="wrap" 
        gap={2}
      >
        <HStack>
          <Text fontSize="xl" fontWeight="bold">
            Мои напоминания
          </Text>
          {renderSyncIndicator()}
        </HStack>
        
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
            {filter === 'all' && 'Все напоминания'}
            {filter === 'active' && 'Активные'}
            {filter === 'completed' && 'Выполненные'}
            {filter === 'upcoming' && 'Предстоящие'}
            {filter === 'overdue' && 'Просроченные'}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => setFilter('all')}>Все напоминания</MenuItem>
            <MenuItem onClick={() => setFilter('active')}>Активные</MenuItem>
            <MenuItem onClick={() => setFilter('completed')}>Выполненные</MenuItem>
            <MenuItem onClick={() => setFilter('upcoming')}>Предстоящие (24ч)</MenuItem>
            <MenuItem onClick={() => setFilter('overdue')}>Просроченные</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      
      {/* Офлайн предупреждение */}
      {!syncStatus.online && (
        <Alert status="warning" borderRadius="md" mb={4}>
          <AlertIcon />
          Приложение работает в автономном режиме. Изменения будут синхронизированы при восстановлении соединения.
        </Alert>
      )}
      
      {/* Форма редактирования */}
      {editingReminder && (
        <Box mb={4}>
          <ReminderForm 
            initialValues={editingReminder}
            onSubmit={handleSaveEdit}
            onCancel={handleCancelEdit}
            isEditing
          />
          <Divider my={4} />
        </Box>
      )}
      
      {/* Список напоминаний */}
      {sortedReminders.length > 0 ? (
        <List spacing={2}>
          {sortedReminders.map(reminder => (
            <ListItem 
              key={reminder._id} 
              p={3} 
              borderWidth="1px" 
              borderRadius="md" 
              borderColor={
                reminder._tempId ? "yellow.300" : 
                reminder.status === "completed" ? "green.100" :
                isPast(new Date(reminder.dueDate)) ? "red.100" : 
                "gray.200"
              }
              bg={
                reminder._tempId ? "yellow.50" : 
                reminder.status === "completed" ? "green.50" :
                isPast(new Date(reminder.dueDate)) ? "red.50" : 
                "white"
              }
              position="relative"
              transition="all 0.2s"
              _hover={{
                boxShadow: "sm",
                borderColor: "blue.300"
              }}
            >
              <Flex justify="space-between" align="flex-start">
                <Flex align="flex-start" flex={1}>
                  <Checkbox 
                    isChecked={reminder.status === 'completed'}
                    onChange={() => handleToggleComplete(reminder)}
                    mr={3}
                    mt={1}
                    colorScheme="green"
                  />
                  <Box>
                    <Text 
                      fontWeight="medium"
                      textDecoration={reminder.status === 'completed' ? 'line-through' : 'none'}
                      color={reminder.status === 'completed' ? 'gray.500' : 'inherit'}
                    >
                      {reminder.title}
                    </Text>
                    <Flex mt={1} align="center" color="gray.600" fontSize="sm">
                      <TimeIcon mr={1} boxSize={3} />
                      <Text>{formatReminderDate(reminder.dueDate)}</Text>
                    </Flex>
                    {reminder.description && (
                      <Text 
                        mt={1} 
                        fontSize="sm" 
                        color="gray.600"
                        noOfLines={2}
                      >
                        {reminder.description}
                      </Text>
                    )}
                    <Flex mt={2} gap={2} wrap="wrap">
                      {getReminderStatusBadge(reminder)}
                      {reminder.category && (
                        <Badge colorScheme="teal" variant="outline">
                          {reminder.category}
                        </Badge>
                      )}
                      {reminder._tempId && (
                        <Badge colorScheme="yellow">
                          Ожидает синхронизации
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                </Flex>
                <Flex>
                  <IconButton
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => handleEdit(reminder)}
                    mr={1}
                    aria-label="Edit"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDelete(reminder._id)}
                    aria-label="Delete"
                  />
                </Flex>
              </Flex>
            </ListItem>
          ))}
        </List>
      ) : (
        <EmptyState 
          icon={InfoIcon}
          title="Нет напоминаний" 
          message={`У вас пока нет ${
            filter === 'all' ? 'напоминаний' : 
            filter === 'active' ? 'активных напоминаний' : 
            filter === 'completed' ? 'выполненных напоминаний' :
            filter === 'upcoming' ? 'предстоящих напоминаний' :
            'просроченных напоминаний'
          }`}
        />
      )}
    </Box>
  );
};

export default ReminderList; 