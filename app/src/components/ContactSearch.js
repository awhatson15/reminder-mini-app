import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Avatar,
  Box,
  Typography,
  InputAdornment,
  Button,
  Tooltip,
  Alert,
  Link
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  ContactPhone as ContactPhoneIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { searchContacts, requestContactsPermission } from '../api/contacts';
import debounce from 'lodash/debounce';

const ContactSearch = ({ onSelect, error, helperText, label = "Поиск контакта" }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [importError, setImportError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  // Проверяем поддержку API при монтировании
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'contacts' in navigator && 
                       'select' in navigator.contacts && 
                       window.location.protocol === 'https:';
      setIsSupported(supported);
      if (!supported) {
        setImportError(
          window.location.protocol !== 'https:' 
            ? 'Для работы с контактами требуется защищенное соединение (HTTPS)'
            : 'Ваш браузер не поддерживает работу с контактами'
        );
      }
    };
    checkSupport();
  }, []);
  
  // Отложенный поиск
  const debouncedSearch = debounce(async (query) => {
    if (!query) {
      setOptions([]);
      return;
    }
    
    try {
      setLoading(true);
      const contacts = await searchContacts(query);
      setOptions(contacts);
    } catch (error) {
      console.error('Ошибка при поиске контактов:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, 300);
  
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);
  
  // Запрос разрешения и импорт контактов
  const handleRequestPermission = async () => {
    try {
      setLoading(true);
      setImportError('');
      const result = await requestContactsPermission();
      if (result) {
        setHasPermission(true);
        // После успешного импорта, ищем по текущему запросу
        if (inputValue) {
          debouncedSearch(inputValue);
        }
      }
    } catch (error) {
      console.error('Ошибка при импорте контактов:', error);
      setImportError(error.message || 'Ошибка при импорте контактов');
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    debouncedSearch(newInputValue);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Autocomplete
          sx={{ flex: 1 }}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => option.name || ''}
          options={options}
          loading={loading}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={(event, newValue) => {
            onSelect(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={error}
              helperText={helperText}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  {option.phones?.[0] && (
                    <Typography variant="caption" color="text.secondary">
                      {option.phones[0]}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
          noOptionsText="Контакты не найдены"
        />
        
        {!hasPermission && isSupported && (
          <Tooltip title="Импортировать контакты телефона">
            <Button
              variant="outlined"
              onClick={handleRequestPermission}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <ContactPhoneIcon />}
            >
              Импорт
            </Button>
          </Tooltip>
        )}
        
        {hasPermission && (
          <Tooltip title="Контакты импортированы">
            <CheckIcon color="success" />
          </Tooltip>
        )}
      </Box>
      
      {importError && (
        <Alert 
          severity="error" 
          sx={{ mt: 1 }} 
          onClose={() => setImportError('')}
          icon={<ErrorIcon />}
        >
          {importError}
          {window.location.protocol !== 'https:' && (
            <Box mt={1}>
              <Typography variant="caption">
                Для работы с контактами откройте приложение по HTTPS:
                <br />
                <Link href={`https://${window.location.host}`} target="_blank">
                  https://{window.location.host}
                </Link>
              </Typography>
            </Box>
          )}
        </Alert>
      )}
      
      {!hasPermission && !loading && !importError && isSupported && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Импортируйте контакты для быстрого поиска
        </Typography>
      )}
    </Box>
  );
};

export default ContactSearch; 