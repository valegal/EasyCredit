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
  Box,
  Typography,
  TextField,
  Grid,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

const AdminLoanTable: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [editingSolicitudId, setEditingSolicitudId] = useState<string | null>(null);
  const [editedEstado, setEditedEstado] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const solicitudesCollection = collection(db, 'solicitudes_credito');
        const solicitudesSnapshot = await getDocs(solicitudesCollection);
        const solicitudesData = solicitudesSnapshot.docs.map((doc) => {
          const solicitudData = doc.data();
          const solicitudes = solicitudData.solicitudes || {};
          return Object.keys(solicitudes).map((solicitudId) => ({
            solicitudId,
            estado: solicitudes[solicitudId].estado,
            dateObjectFechaVencimiento: solicitudes[solicitudId].dateObjectFechaVencimiento,
            userId: doc.id,
            datosUsuario: solicitudes[solicitudId].datosUsuario,
            monto: solicitudes[solicitudId].monto,
            plazo: solicitudes[solicitudId].plazo,
            intereses: solicitudes[solicitudId].intereses, 
            aval: solicitudes[solicitudId].aval, 
            cobranza: solicitudes[solicitudId].cobranza, 
            mora: solicitudes[solicitudId].mora, 
            totalAPagar: solicitudes[solicitudId].totalAPagar, 
            descuento: solicitudes[solicitudId].descuento, 
            fechaSolicitud: solicitudes[solicitudId].fechaSolicitud, 
          }));
        });
        const flattenedSolicitudes = solicitudesData.flat();
       
        setSolicitudes(flattenedSolicitudes);
      } catch (error) {
        console.error('Error al obtener las solicitudes de crédito:', error);
      }
    };
  
    fetchData();
  }, []);
  

  const handleEdit = (solicitudId: string, estado: string) => {
    setEditingSolicitudId(solicitudId);
    setEditedEstado(estado);
  };

  const handleSave = async (solicitudId: string, userId: string) => {
    try {
      const solicitudDocRef = doc(db, 'solicitudes_credito', userId);

      const fechaAprobacion = editedEstado === 'Aprobada' ? new Date() : null;
      const fechaNegacion = editedEstado === 'Negada' ? new Date() : null;

      await updateDoc(solicitudDocRef, {
        [`solicitudes.${solicitudId}.estado`]: editedEstado,
        ...(fechaAprobacion && { [`solicitudes.${solicitudId}.fechaAprobacion`]: fechaAprobacion }),
        ...(fechaNegacion && { [`solicitudes.${solicitudId}.fechaNegacion`]: fechaNegacion }),
      });

      const updatedSolicitudes = solicitudes.map((solicitud) => {
        if (solicitud.solicitudId === solicitudId) {
          return {
            ...solicitud,
            estado: editedEstado,
            ...(fechaAprobacion && { fechaAprobacion }),
            ...(fechaNegacion && { fechaNegacion }),
          };
        }
        return solicitud;
      });

      setSolicitudes(updatedSolicitudes);
      setEditingSolicitudId(null);
    } catch (error) {
      console.error('Error al actualizar el estado de la solicitud:', error);
    }
  };

  const handleCancel = () => {
    setEditingSolicitudId(null);
  };

  const handleFilterChange = (estado: string) => {
    setFilterEstado(estado);
  };

  return (
    <Box p={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography style={{ marginBottom:'12px' }}  variant="h5">Administrar Solicitudes de Crédito</Typography>
        </Grid>
        <Grid item xs={12} md={6} style={{ textAlign: 'right' }}>
  <Box display="flex" alignItems="center"  maxWidth="200px">
  <FilterListIcon style={{ marginBottom:'8px' }} />
  <FormControl color='info' variant='standard' style={{ width: '200px', marginRight: '5px' }}>
      <InputLabel variant='outlined' style={{marginLeft:'10px'}}>Filtro por estado</InputLabel>
            <Select style={{ marginBottom:'12px' }}
              value={filterEstado}
              onChange={(e) => handleFilterChange(e.target.value as string)}
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
          </Box>
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
              <Table>
              <TableHead style={{ color: '#131338', backgroundColor: '#d6edcc' }}>
                  <TableRow>
                    <TableCell>ID de Solicitud</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>ID de Usuario</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>Fecha de Vencimiento</TableCell>
                    <TableCell>Días Vencimiento</TableCell>

                    <TableCell>Intereses</TableCell>
              <TableCell >Aval</TableCell>
              <TableCell>Cobranza</TableCell>
              <TableCell>Mora</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap' }}>Total a pagar</TableCell>
              <TableCell >Descuento</TableCell>
              <TableCell>Fecha de solicitud</TableCell>

                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudes
                    .filter((solicitud) => (filterEstado ? solicitud.estado === filterEstado : true))
                    .map((solicitud) => (
                      <TableRow key={solicitud.solicitudId}>
                        <TableCell>{solicitud.solicitudId}</TableCell>
                        <TableCell>
                    {editingSolicitudId === solicitud.solicitudId ? (
                      <FormControl color='success' variant='standard' style={{ width: '180px' }}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={editedEstado}
                          onChange={(e) => setEditedEstado(e.target.value as string)}
                        >
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
                    ) : (
                      solicitud.estado
                    )}
                  </TableCell>
                        <TableCell>{solicitud.userId}</TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {solicitud.datosUsuario ? (
                            solicitud.datosUsuario.nombre || solicitud.datosUsuario.Nombres || 'Sin nombre'
                          ) : (
                            'Sin información de usuario'
                          )}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {solicitud.datosUsuario ? (
                            solicitud.datosUsuario.apellido ||
                            solicitud.datosUsuario.Apellidos ||
                            'Sin apellido'
                          ) : (
                            'Sin información de usuario'
                          )}
                        </TableCell>
                        <TableCell>
                          {solicitud.datosUsuario ? (
                            solicitud.datosUsuario.telefono || 'Sin teléfono'
                          ) : (
                            'Sin información de usuario'
                          )}
                        </TableCell>
                        <TableCell style={{whiteSpace: 'nowrap'}}>$ {solicitud.monto}</TableCell>
                        <TableCell>{new Date(solicitud.dateObjectFechaVencimiento.seconds * 1000).toLocaleDateString()}</TableCell>
                        <TableCell>{solicitud.plazo.dias}</TableCell>

                        <TableCell style={{ whiteSpace: 'nowrap', backgroundColor: '#e9f0f5' }}>$ {solicitud.intereses}</TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap', backgroundColor: '#e9f0f5' }}>$ {solicitud.aval}</TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap', backgroundColor: '#e9f0f5' }}>$ {solicitud.cobranza}</TableCell>
                        <TableCell style={{whiteSpace: 'nowrap', backgroundColor: '#e9f0f5' }}>$ {solicitud.mora}</TableCell>
                        <TableCell style={{ backgroundColor: '#e9f0f5' }}>$ {solicitud.totalAPagar}</TableCell>
                        <TableCell style={{whiteSpace: 'nowrap', backgroundColor: '#e9f0f5' }}>$ {solicitud.descuento}</TableCell>
                        <TableCell style={{whiteSpace: 'nowrap', backgroundColor: '#e9f0f5' }}>{solicitud.fechaSolicitud}</TableCell>
                        <TableCell>
                          {editingSolicitudId === solicitud.solicitudId ? (
                            <>
                              <Button size='small' color='success' variant='text' onClick={() => handleSave(solicitud.solicitudId, solicitud.userId)}>
                                ✅Guardar
                              </Button>
                              <Button size='small' color='error' variant='text' onClick={handleCancel}>🚫Cancelar</Button>
                            </>
                          ) : (
                            <Button variant='outlined' onClick={() => handleEdit(solicitud.solicitudId, solicitud.estado)}>
                              Editar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
    </Box>
  );
};

export default AdminLoanTable;
