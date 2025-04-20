import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';
import api from './apiService';
import { getLocalStorage, setLocalStorage } from '../utils/storage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Настраиваем хранилище для кэша напоминаний
const reminderStore = localforage.createInstance({
  name: 'reminderApp',
  storeName: 'reminders'
});

// Настраиваем хранилище для очереди действий (для офлайн режима)
const actionQueue = localforage.createInstance({
  name: 'reminderApp',
  storeName: 'actionQueue'
});

// Ключи для хранилища
const REMINDERS_CACHE_KEY = 'reminders_cache';
const QUEUE_KEY = 'pending_actions';
const LAST_SYNC_KEY = 'last_sync_time';

// Статусы действий
const ACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Типы действий
const ACTION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  COMPLETE: 'complete',
  ACTIVATE: 'activate',
};

// Ключи для хранения данных
const KEYS = {
  REMINDERS: 'reminders',
  PENDING_SYNC: 'pending_sync',
  LAST_SYNC: 'last_sync_timestamp',
};

class ReminderService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingActions = [];
    this.isInitialized = false;
    this.syncTimeoutId = null;
    this.reminders = this.getRemindersFromStorage() || [];
    this.pendingSyncItems = this.getPendingSyncFromStorage() || [];
    this.lastSyncTimestamp = this.getLastSyncTimestamp() || null;
    this.initPromise = null;
    
    // Привязка методов
    this.initializeOfflineSupport = this.initializeOfflineSupport.bind(this);
    this.handleOnlineStatus = this.handleOnlineStatus.bind(this);
    this.syncWithServer = this.syncWithServer.bind(this);
    
    // Инициализация поддержки офлайн режима
    this.initializeOfflineSupport();
    
    // Настройка перехватчика запросов axios
    this.setupAxiosInterceptors();
  }
  
  // Инициализация поддержки офлайн режима
  async initializeOfflineSupport() {
    // Добавляем обработчики событий онлайн/офлайн
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);
    
    try {
      // Загрузка очереди действий из хранилища
      const queue = await actionQueue.getItem(QUEUE_KEY) || [];
      this.pendingActions = queue;
      
      // Запуск синхронизации, если мы онлайн
      if (this.isOnline) {
        this.scheduleSyncWithServer();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Ошибка инициализации офлайн поддержки:', error);
    }
  }
  
  // Обработчик изменения статуса онлайн/офлайн
  handleOnlineStatus() {
    const wasOffline = !this.isOnline;
    this.isOnline = navigator.onLine;
    
    // Если мы перешли из офлайн в онлайн режим, запускаем синхронизацию
    if (wasOffline && this.isOnline) {
      this.scheduleSyncWithServer();
    }
  }
  
  // Планирование синхронизации с сервером
  scheduleSyncWithServer(delay = 5000) {
    // Отменяем предыдущий таймер, если он есть
    if (this.syncTimeoutId) {
      clearTimeout(this.syncTimeoutId);
    }
    
    // Создаем новый таймер
    this.syncTimeoutId = setTimeout(() => {
      this.syncWithServer();
    }, delay);
  }
  
  // Синхронизация с сервером
  async syncWithServer() {
    if (!this.isOnline) {
      return { success: false, reason: 'offline' };
    }
    
    // Если нет изменений для синхронизации
    if (this.pendingSyncItems.length === 0) {
      try {
        // Просто получаем последние данные с сервера
        const remindersFromServer = await api.get('/reminders');
        
        // Обновляем локальное хранилище
        this.reminders = remindersFromServer.data.map(reminder => ({
          ...reminder,
          synced: true,
        }));
        
        this.saveRemindersToStorage();
        this.updateLastSyncTimestamp();
        
        return { success: true, synced: 0 };
      } catch (error) {
        console.error('Ошибка при получении напоминаний с сервера:', error);
        return { success: false, reason: 'server_error', error };
      }
    }
    
    // Сортируем по времени создания, чтобы операции выполнялись в правильном порядке
    const sortedItems = [...this.pendingSyncItems].sort((a, b) => a.timestamp - b.timestamp);
    
    const syncResults = {
      success: true,
      total: sortedItems.length,
      synced: 0,
      failed: 0,
      errors: [],
    };
    
    // Обрабатываем каждый элемент по очереди
    for (const item of sortedItems) {
      try {
        let result;
        
        switch (item.action) {
          case 'create':
            // Если ID начинается с "local_", это локальное напоминание
            if (item.data.id.startsWith('local_')) {
              // Удаляем локальный ID перед отправкой на сервер
              const { id, synced, ...dataToSend } = item.data;
              
              // Отправляем запрос на создание
              result = await api.post('/reminders', dataToSend);
              
              if (result.status === 201 || result.status === 200) {
                // Находим и обновляем локальное напоминание с новым ID с сервера
                const serverReminder = result.data;
                
                const localIndex = this.reminders.findIndex(r => r.id === item.data.id);
                if (localIndex !== -1) {
                  this.reminders[localIndex] = {
                    ...serverReminder,
                    synced: true,
                  };
                }
              }
            }
            break;
            
          case 'update':
            // Если ID не начинается с "local_", это напоминание с сервера
            if (!item.data.id.startsWith('local_')) {
              const { synced, ...dataToSend } = item.data;
              
              // Отправляем запрос на обновление
              result = await api.put(`/reminders/${item.data.id}`, dataToSend);
              
              if (result.status === 200) {
                // Обновляем локальное напоминание
                const localIndex = this.reminders.findIndex(r => r.id === item.data.id);
                if (localIndex !== -1) {
                  this.reminders[localIndex] = {
                    ...result.data,
                    synced: true,
                  };
                }
              }
            }
            break;
            
          case 'delete':
            // Если ID не начинается с "local_", это напоминание с сервера
            if (!item.data.id.startsWith('local_')) {
              // Отправляем запрос на удаление
              result = await api.delete(`/reminders/${item.data.id}`);
              
              // Если успешно, удаляем уже удалено из локального хранилища
            }
            break;
            
          default:
            console.warn(`Неизвестное действие синхронизации: ${item.action}`);
            break;
        }
        
        // Увеличиваем счетчик успешно синхронизированных элементов
        syncResults.synced++;
        
        // Удаляем элемент из очереди синхронизации
        const itemIndex = this.pendingSyncItems.findIndex(
          i => i.timestamp === item.timestamp && i.action === item.action
        );
        
        if (itemIndex !== -1) {
          this.pendingSyncItems.splice(itemIndex, 1);
        }
        
      } catch (error) {
        syncResults.failed++;
        syncResults.errors.push({
          item,
          error: error.message,
        });
        
        // Если ошибка 404 при обновлении или удалении, удаляем из очереди синхронизации
        if (error.response && error.response.status === 404 && 
            (item.action === 'update' || item.action === 'delete')) {
          const itemIndex = this.pendingSyncItems.findIndex(
            i => i.timestamp === item.timestamp && i.action === item.action
          );
          
          if (itemIndex !== -1) {
            this.pendingSyncItems.splice(itemIndex, 1);
          }
          
          // Также удаляем из локального хранилища напоминание, которого нет на сервере
          if (item.action === 'update') {
            const localIndex = this.reminders.findIndex(r => r.id === item.data.id);
            if (localIndex !== -1) {
              this.reminders.splice(localIndex, 1);
            }
          }
        }
      }
    }
    
    // Обновляем локальное хранилище
    this.saveRemindersToStorage();
    this.savePendingSyncToStorage();
    this.updateLastSyncTimestamp();
    
    // Если все элементы синхронизированы, получаем последние данные с сервера
    if (this.pendingSyncItems.length === 0) {
      try {
        const remindersFromServer = await api.get('/reminders');
        
        // Обновляем локальное хранилище, сохраняя локальные напоминания
        const localReminders = this.reminders.filter(r => r.id.startsWith('local_'));
        
        this.reminders = [
          ...remindersFromServer.data.map(reminder => ({
            ...reminder,
            synced: true,
          })),
          ...localReminders,
        ];
        
        this.saveRemindersToStorage();
      } catch (error) {
        console.error('Ошибка при получении напоминаний с сервера после синхронизации:', error);
      }
    }
    
    return syncResults;
  }
  
  // Принудительная синхронизация
  async syncNow() {
    return this.syncWithServer();
  }
  
  // Обновление кэша с сервера
  async refreshCache() {
    if (!this.isOnline) {
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/reminders`);
      const reminders = response.data;
      
      // Получаем текущий кэш
      const cachedReminders = await this.getCachedReminders();
      
      // Сохраняем локальные (временные) напоминания
      const localReminders = cachedReminders.filter(r => r._tempId);
      
      // Объединяем локальные напоминания с данными с сервера
      const mergedReminders = [...reminders, ...localReminders];
      
      // Сохраняем в кэше
      await reminderStore.setItem(REMINDERS_CACHE_KEY, mergedReminders);
      
      // Обновляем время последней синхронизации
      await reminderStore.setItem(LAST_SYNC_KEY, new Date().toISOString());
      
      return mergedReminders;
    } catch (error) {
      console.error('Ошибка при обновлении кэша:', error);
      throw error;
    }
  }
  
  // Получение напоминаний из кэша
  async getCachedReminders() {
    try {
      const reminders = await reminderStore.getItem(REMINDERS_CACHE_KEY) || [];
      return reminders;
    } catch (error) {
      console.error('Ошибка при получении кэшированных напоминаний:', error);
      return [];
    }
  }
  
  // Обновление временного ID на реальный после синхронизации
  async updateCachedItemTempId(tempId, serverData) {
    try {
      // Получаем текущий кэш
      const reminders = await this.getCachedReminders();
      
      // Находим индекс напоминания с временным ID
      const index = reminders.findIndex(r => r._tempId === tempId);
      
      if (index !== -1) {
        // Заменяем временное напоминание на данные с сервера
        reminders[index] = { ...serverData };
        
        // Обновляем кэш
        await reminderStore.setItem(REMINDERS_CACHE_KEY, reminders);
      }
    } catch (error) {
      console.error('Ошибка при обновлении временного ID:', error);
    }
  }
  
  // Добавление действия в очередь
  async addToQueue(action) {
    // Добавляем действие в список ожидающих
    this.pendingActions.push(action);
    
    // Сохраняем в хранилище
    await actionQueue.setItem(QUEUE_KEY, this.pendingActions);
    
    // Если мы онлайн, планируем синхронизацию
    if (this.isOnline) {
      this.scheduleSyncWithServer();
    }
  }
  
  // Настройка перехватчиков запросов axios
  setupAxiosInterceptors() {
    // Перехватчик запросов для добавления заголовков
    axios.interceptors.request.use(
      config => {
        // Добавляем пользовательские заголовки
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    
    // Перехватчик ответов для обработки ошибок
    axios.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        // Если нет ответа от сервера, устанавливаем офлайн режим
        if (!error.response && error.message.includes('Network Error')) {
          this.isOnline = false;
        }
        return Promise.reject(error);
      }
    );
  }
  
  // Получение статуса синхронизации
  getSyncStatus() {
    const pendingCount = this.pendingSyncItems.length;
    
    return {
      online: this.isOnline,
      pendingCount,
      lastSync: this.lastSyncTimestamp,
    };
  }
  
  //================================================
  // Публичные методы для работы с напоминаниями
  //================================================
  
  // Получение всех напоминаний
  async getReminders(forceRefresh = false) {
    try {
      // Если требуется обновление или кэш пуст, запрашиваем с сервера
      if (forceRefresh && this.isOnline) {
        return await this.refreshCache();
      }
      
      // Получаем напоминания из кэша
      const cachedReminders = await this.getCachedReminders();
      
      // Если кэш пуст и мы онлайн, запрашиваем с сервера
      if (cachedReminders.length === 0 && this.isOnline) {
        return await this.refreshCache();
      }
      
      return cachedReminders;
    } catch (error) {
      console.error('Ошибка при получении напоминаний:', error);
      
      // В случае ошибки возвращаем данные из кэша
      return await this.getCachedReminders();
    }
  }
  
  // Получение напоминаний по статусу
  async getRemindersByStatus(status, forceRefresh = false) {
    const reminders = await this.getReminders(forceRefresh);
    return reminders.filter(reminder => reminder.status === status);
  }
  
  // Получение предстоящих напоминаний (в течение указанного количества часов)
  async getUpcomingReminders(hours = 24, forceRefresh = false) {
    const reminders = await this.getReminders(forceRefresh);
    const now = new Date();
    const future = new Date(now);
    future.setHours(future.getHours() + hours);
    
    return reminders.filter(reminder => {
      if (reminder.status === 'completed') return false;
      
      const dueDate = new Date(reminder.dueDate);
      return dueDate >= now && dueDate <= future;
    });
  }
  
  // Получение просроченных напоминаний
  async getOverdueReminders(forceRefresh = false) {
    const reminders = await this.getReminders(forceRefresh);
    const now = new Date();
    
    return reminders.filter(reminder => {
      if (reminder.status === 'completed') return false;
      
      const dueDate = new Date(reminder.dueDate);
      return dueDate < now;
    });
  }
  
  // Получение напоминания по ID
  async getReminder(id) {
    // Проверяем в кэше
    const cachedReminders = await this.getCachedReminders();
    const cachedReminder = cachedReminders.find(r => r._id === id || r._tempId === id);
    
    if (cachedReminder) {
      return cachedReminder;
    }
    
    // Если не нашли в кэше и мы онлайн, запрашиваем с сервера
    if (this.isOnline) {
      try {
        const response = await axios.get(`${API_URL}/reminders/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении напоминания ${id}:`, error);
        throw error;
      }
    } else {
      throw new Error('Напоминание не найдено в кэше, и нет подключения к сети');
    }
  }
  
  // Создание нового напоминания
  async createReminder(reminderData) {
    await this.ensureInitialized();
    
    // Создаем локальный ID для нового напоминания
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Создаем объект напоминания
    const newReminder = {
      ...reminderData,
      id: localId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
    };
    
    // Добавляем в локальное хранилище
    this.reminders.push(newReminder);
    this.saveRemindersToStorage();
    
    // Добавляем в очередь синхронизации
    this.addToSyncQueue({
      action: 'create',
      data: newReminder,
      timestamp: Date.now(),
    });
    
    // Пытаемся синхронизировать, если онлайн
    if (navigator.onLine) {
      this.syncWithServer().catch(error => {
        console.error('Ошибка при синхронизации после создания напоминания:', error);
      });
    }
    
    return newReminder;
  }
  
  // Обновление напоминания
  async updateReminder(id, reminderData) {
    await this.ensureInitialized();
    
    // Находим напоминание в локальном хранилище
    const reminderIndex = this.reminders.findIndex(r => r.id === id);
    
    if (reminderIndex === -1) {
      throw new Error(`Напоминание с ID ${id} не найдено`);
    }
    
    // Получаем текущее напоминание
    const currentReminder = this.reminders[reminderIndex];
    
    // Создаем обновленное напоминание
    const updatedReminder = {
      ...currentReminder,
      ...reminderData,
      updatedAt: new Date().toISOString(),
      synced: false,
    };
    
    // Обновляем в локальном хранилище
    this.reminders[reminderIndex] = updatedReminder;
    this.saveRemindersToStorage();
    
    // Добавляем в очередь синхронизации
    this.addToSyncQueue({
      action: 'update',
      data: updatedReminder,
      timestamp: Date.now(),
    });
    
    // Пытаемся синхронизировать, если онлайн
    if (navigator.onLine) {
      this.syncWithServer().catch(error => {
        console.error('Ошибка при синхронизации после обновления напоминания:', error);
      });
    }
    
    return updatedReminder;
  }
  
  // Удаление напоминания
  async deleteReminder(id) {
    await this.ensureInitialized();
    
    // Находим напоминание в локальном хранилище
    const reminderIndex = this.reminders.findIndex(r => r.id === id);
    
    if (reminderIndex === -1) {
      throw new Error(`Напоминание с ID ${id} не найдено`);
    }
    
    // Получаем удаляемое напоминание
    const reminderToDelete = this.reminders[reminderIndex];
    
    // Удаляем из локального хранилища
    this.reminders.splice(reminderIndex, 1);
    this.saveRemindersToStorage();
    
    // Если напоминание было только локальным и никогда не синхронизировалось с сервером
    if (reminderToDelete.id.startsWith('local_')) {
      // Удаляем из очереди синхронизации все операции с этим напоминанием
      this.pendingSyncItems = this.pendingSyncItems.filter(
        item => !(item.data && item.data.id === reminderToDelete.id)
      );
      this.savePendingSyncToStorage();
    } else {
      // Добавляем в очередь синхронизации
      this.addToSyncQueue({
        action: 'delete',
        data: { id: reminderToDelete.id },
        timestamp: Date.now(),
      });
    }
    
    // Пытаемся синхронизировать, если онлайн
    if (navigator.onLine) {
      this.syncWithServer().catch(error => {
        console.error('Ошибка при синхронизации после удаления напоминания:', error);
      });
    }
    
    return true;
  }
  
  // Отметка напоминания как выполненного
  async markAsCompleted(id) {
    // Получаем текущие данные напоминания
    const cachedReminders = await this.getCachedReminders();
    const reminderIndex = cachedReminders.findIndex(r => r._id === id || r._tempId === id);
    
    if (reminderIndex === -1) {
      throw new Error('Напоминание не найдено');
    }
    
    const reminder = cachedReminders[reminderIndex];
    const isTemp = !!reminder._tempId;
    
    // Обновляем в кэше
    const updatedReminder = {
      ...reminder,
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    cachedReminders[reminderIndex] = updatedReminder;
    await reminderStore.setItem(REMINDERS_CACHE_KEY, cachedReminders);
    
    // Если это временное напоминание, которое еще не отправлено на сервер,
    // обновляем его в очереди действий
    if (isTemp) {
      const queueItemIndex = this.pendingActions.findIndex(
        action => action.type === ACTION_TYPES.CREATE && action.tempId === reminder._tempId
      );
      
      if (queueItemIndex !== -1) {
        this.pendingActions[queueItemIndex].data = {
          ...this.pendingActions[queueItemIndex].data,
          status: 'completed',
          completedAt: new Date().toISOString()
        };
        
        await actionQueue.setItem(QUEUE_KEY, this.pendingActions);
      }
    } else {
      // Добавляем действие в очередь
      await this.addToQueue({
        id: uuidv4(),
        type: ACTION_TYPES.COMPLETE,
        targetId: id,
        createdAt: new Date().toISOString(),
        status: ACTION_STATUS.PENDING
      });
    }
    
    return cachedReminders[reminderIndex];
  }
  
  // Отметка напоминания как активного
  async markAsActive(id) {
    // Получаем текущие данные напоминания
    const cachedReminders = await this.getCachedReminders();
    const reminderIndex = cachedReminders.findIndex(r => r._id === id || r._tempId === id);
    
    if (reminderIndex === -1) {
      throw new Error('Напоминание не найдено');
    }
    
    const reminder = cachedReminders[reminderIndex];
    const isTemp = !!reminder._tempId;
    
    // Обновляем в кэше
    cachedReminders[reminderIndex] = {
      ...reminder,
      status: 'active',
      completedAt: null,
      updatedAt: new Date().toISOString()
    };
    
    await reminderStore.setItem(REMINDERS_CACHE_KEY, cachedReminders);
    
    // Если это временное напоминание, обновляем его в очереди действий
    if (isTemp) {
      const queueItemIndex = this.pendingActions.findIndex(
        action => action.type === ACTION_TYPES.CREATE && action.tempId === reminder._tempId
      );
      
      if (queueItemIndex !== -1) {
        this.pendingActions[queueItemIndex].data = {
          ...this.pendingActions[queueItemIndex].data,
          status: 'active',
          completedAt: null
        };
        
        await actionQueue.setItem(QUEUE_KEY, this.pendingActions);
      }
    } else {
      // Добавляем действие в очередь
      await this.addToQueue({
        id: uuidv4(),
        type: ACTION_TYPES.ACTIVATE,
        targetId: id,
        createdAt: new Date().toISOString(),
        status: ACTION_STATUS.PENDING
      });
    }
    
    return cachedReminders[reminderIndex];
  }
  
  // Очистка кэша и очереди (использовать с осторожностью)
  async clearStorage() {
    await reminderStore.clear();
    await actionQueue.clear();
    this.pendingActions = [];
    console.log('Хранилище очищено');
  }
  
  // Приватные методы
  
  // Убедиться, что сервис инициализирован
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }
  
  // Добавление операции в очередь синхронизации
  addToSyncQueue(item) {
    this.pendingSyncItems.push(item);
    this.savePendingSyncToStorage();
  }
  
  // Обновление времени последней синхронизации
  updateLastSyncTimestamp() {
    this.lastSyncTimestamp = Date.now();
    setLocalStorage(KEYS.LAST_SYNC, this.lastSyncTimestamp);
  }
  
  // Получение напоминаний из локального хранилища
  getRemindersFromStorage() {
    return getLocalStorage(KEYS.REMINDERS) || [];
  }
  
  // Сохранение напоминаний в локальное хранилище
  saveRemindersToStorage() {
    setLocalStorage(KEYS.REMINDERS, this.reminders);
  }
  
  // Получение очереди синхронизации из локального хранилища
  getPendingSyncFromStorage() {
    return getLocalStorage(KEYS.PENDING_SYNC) || [];
  }
  
  // Сохранение очереди синхронизации в локальное хранилище
  savePendingSyncToStorage() {
    setLocalStorage(KEYS.PENDING_SYNC, this.pendingSyncItems);
  }
  
  // Получение времени последней синхронизации
  getLastSyncTimestamp() {
    return getLocalStorage(KEYS.LAST_SYNC);
  }
  
  // Инициализация сервиса
  async init() {
    if (this.isInitialized) return;
    
    // Если уже идет инициализация, возвращаем существующий Promise
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise(async (resolve) => {
      try {
        // Пытаемся синхронизировать данные с сервером
        if (navigator.onLine) {
          await this.syncWithServer();
        }
      } catch (error) {
        console.error('Ошибка при инициализации ReminderService:', error);
      } finally {
        this.isInitialized = true;
        resolve();
        this.initPromise = null;
      }
    });
    
    return this.initPromise;
  }
}

// Создаем и экспортируем единственный экземпляр сервиса
const reminderService = new ReminderService();
export default reminderService; 