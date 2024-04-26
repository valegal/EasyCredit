import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
} from '@mui/material';

const AdminUsersTable: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCollection = collection(db, 'usuarios');
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map((doc) => ({
          userId: doc.id,
          data: doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    };

    fetchData();
  }, []);

  const handleEditCalificacionCrediticia = async (userId: string, calificacionCrediticia: string) => {
    try {
      const userDocRef = doc(db, 'usuarios', userId);
      await updateDoc(userDocRef, {
        calificacionCrediticia,
      });

      const updatedUsers = users.map((user) => {
        if (user.userId === userId) {
          return {
            ...user,
            data: {
              ...user.data,
              calificacionCrediticia,
            },
          };
        }
        return user;
      });

      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error al actualizar la calificación crediticia del usuario:', error);
    }
  };

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Administrar Usuarios</Typography>
        
      </Box>

      <TableContainer component={Paper}>
        <Table>
        <TableHead style={{ color: '#5800FF', backgroundColor: '#def6ff' }}>
            <TableRow>
            <TableCell>ID de Usuario</TableCell>
            <TableCell>Nombres</TableCell>
            <TableCell>Apellidos</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Calificación Crediticia</TableCell>
            <TableCell>Número de Cédula</TableCell>
            <TableCell>Dirección</TableCell>
            <TableCell>Ciudad</TableCell>
            <TableCell>Banco</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Tipo de cuenta</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Número de cuenta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {users
        .filter(user => user.data.email !== 'admin@easycredit.com') // Filtrar el usuario con correo específico
        .map((user) => (
        <TableRow key={user.userId}>
          <TableCell>{user.userId}</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>{user.data.Nombres || user.data.nombre || 'Sin info'}</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>{user.data.Apellidos || user.data.apellido || 'Sin info'}</TableCell>
          <TableCell>{user.data.telefono || 'Sin info'}</TableCell>
          <TableCell>
            <FormControl color='success' variant='standard' style={{ width: '180px' }}>
              <InputLabel></InputLabel>
              <Select
                value={user.data.calificacionCrediticia || 'Sin información'}
                onChange={(e) => handleEditCalificacionCrediticia(user.userId, e.target.value as string)}
              >
                <MenuItem value="Elegible AA">Elegible AA</MenuItem>
                <MenuItem value="Elegible A">Elegible A</MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="No elegible">No elegible</MenuItem>
                <MenuItem value="Sin información">Sin información</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>{user.data.documentoId || 'Sin info'}</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>{user.data.direccion || 'Sin info'}</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>{user.data.ciudadResidencia || 'Sin info'}</TableCell> {/* Ajustar según tus datos */}
          <TableCell style={{ whiteSpace: 'nowrap' }}>{user.data.entidadBancaria || 'Sin info'}</TableCell>
          <TableCell>{user.data.tipoCuenta || 'Sin info'}</TableCell>
          <TableCell>{user.data.numeroCuenta || 'Sin info'}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
      </Box>

  );
};

export default AdminUsersTable;
