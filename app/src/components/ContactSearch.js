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
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  ContactPhone as ContactPhoneIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { searchContacts, requestContactsPermission } from '../api/contacts';
import debounce from 'lodash/debounce';

const ContactSearch = ({ onSelect, error, helperText, label = "Поиск контакта" }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  
  // Проверяем разрешение при монтировании
  useEffect(() => {
    checkPermission();
  }, []);
  
  const checkPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'contacts' });
      setHasPermission(permission.state === 'granted');
    } catch (error) {
      console.error('Ошибка при проверке разрешения:', error);
    } finally {
      setCheckingPermission(false);
    }
  };
  
  // Запрос разрешения
  const handleRequestPermission = async () => {
    try {
      setLoading(true);
      await requestContactsPermission();
      setHasPermission(true);
      // После получения разрешения, сразу ищем по текущему запросу
      if (inputValue) {
        debouncedSearch(inputValue);
      }
    } catch (error) {
      console.error('Ошибка при запросе разрешения:', error);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    if (hasPermission) {
      debouncedSearch(newInputValue);
    }
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
        />
        
        {!checkingPermission && !hasPermission && (
          <Tooltip title="Разрешить доступ к контактам телефона">
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
          <Tooltip title="Доступ к контактам разрешен">
            <CheckIcon color="success" />
          </Tooltip>
        )}
      </Box>
      
      {!hasPermission && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Разрешите доступ к контактам телефона для быстрого поиска
        </Typography>
      )}
    </Box>
  );
};

export default ContactSearch; 