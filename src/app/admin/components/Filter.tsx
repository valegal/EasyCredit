import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface EstadoFilterProps {
  estado: string;
  onFilterChange: (estado: string) => void;
}

const Filter: React.FC<EstadoFilterProps> = ({ estado, onFilterChange }) => {
  return (
    <FormControl sx={{ minWidth: 200, marginRight: 2 }}>
      <InputLabel sx={{ marginBottom: 4, fontSize: 16, color: '#555' }}>Filtrar por Estado</InputLabel>
      <Select
        value={estado}
        onChange={(e) => onFilterChange(e.target.value as string)}
        sx={{
            
            width: '100%',
            border: '1px solid #ddd',
            borderRadius: '40px',
            padding: '1px',  
            background: '#fff',  
            color: '#333',  
            fontSize: '14px', 
            boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)',
            '&:focus': {
              borderColor: '#2196F3',
              
            },
          }}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="Solicitud Enviada">Solicitud Enviada</MenuItem>
        <MenuItem value="En revisión">En revisión</MenuItem>
        <MenuItem value="Negada">Negada</MenuItem>
        <MenuItem value="Aprobada">Aprobada</MenuItem>
        <MenuItem value="Pagada">Pagada</MenuItem>
        <MenuItem value="En Mora">En Mora</MenuItem>
        <MenuItem value="Novado">Novado</MenuItem>
        <MenuItem value="Desembolsado">Desembolsado</MenuItem>
      </Select>
    </FormControl>
  );
};

export default Filter;
