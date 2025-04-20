import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Avatar,
  Box,
  Typography,
  InputAdornment
} from '@mui/material';
import { Person as PersonIcon, Search as SearchIcon } from '@mui/icons-material';
import { searchContacts } from '../api/contacts';
import debounce from 'lodash/debounce';

const ContactSearch = ({ onSelect, error, helperText, label = "Поиск контакта" }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
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
    debouncedSearch(newInputValue);
  };
  
  return (
    <Autocomplete
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
            {option.photo ? (
              <Avatar src={option.photo} alt={option.name} sx={{ width: 32, height: 32 }} />
            ) : (
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
            )}
            <Box>
              <Typography variant="body1">{option.name}</Typography>
              {option.birthday && (
                <Typography variant="caption" color="text.secondary">
                  День рождения: {new Date(option.birthday).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}
    />
  );
};

export default ContactSearch; 