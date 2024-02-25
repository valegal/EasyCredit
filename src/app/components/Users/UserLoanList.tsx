// Importaciones necesarias
import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

// Estilos para la fuente "Roboto Thin"
const poppinsFont = {
  fontFamily: 'Poppins, sans-serif',
  color: 'grey',
};
// Definición de la interfaz
interface SolicitudCredito {
  monto: number;
  plazo: {
    dias: number;
    fechaVencimiento: string;
  };
  intereses: number;
  aval: number;
  totalAPagar: number;
  estado: string;
  fechaSolicitud: string;
  dateObjectSolicitud: {
    seconds: number;
    nanoseconds: number;
  };
  dateObjectFechaVencimiento: {
    seconds: number;
    nanoseconds: number;
  };
  

}

// Componente principal
const UserLoanList: React.FC = () => {
  // Obtener la sesión del usuario
  const { data: session, status } = useSession();
  // Estado para almacenar las solicitudes del usuario
  const [solicitudesUsuario, setSolicitudesUsuario] = useState<Record<string, SolicitudCredito>>({});

  // Efecto para cargar las solicitudes del usuario
  useEffect(() => {
    const consultarSolicitudesUsuario = async () => {
      try {
        if (status === 'authenticated' && session?.user?.email) {
          const userSolicitudesCollectionRef = collection(db, 'solicitudes_credito');
          const userDocRef = doc(userSolicitudesCollectionRef, session.user.email);

          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const solicitudesUsuarioData = userDocSnap.data().solicitudes;
            setSolicitudesUsuario(solicitudesUsuarioData);
          }
        }
      } catch (error) {
        console.error('Error al consultar las solicitudes del usuario:', error);
      }
    };

    // Se añade una verificación para ejecutar la consulta solo una vez al montar el componente
    if (status === 'authenticated' && session?.user?.email && Object.keys(solicitudesUsuario).length === 0) {
      consultarSolicitudesUsuario();
    }
  }, [status, session, solicitudesUsuario]);

  // Función para ordenar las solicitudes por fecha de solicitud utilizando el campo dateObjectSolicitud
  const ordenarSolicitudesPorFecha = () => {
    const solicitudesArray: [string, SolicitudCredito][] = Object.entries(solicitudesUsuario);
    solicitudesArray.sort(
      ([, a], [, b]) => b.dateObjectSolicitud.seconds - a.dateObjectSolicitud.seconds || b.dateObjectSolicitud.nanoseconds - a.dateObjectSolicitud.nanoseconds
    );
    return solicitudesArray.reduce((acc, [id, solicitud]) => ({ ...acc, [id]: solicitud }), {} as Record<string, SolicitudCredito>);
  };

  // Renderizar el componente
  return (
    <div className="bg-credimonto-green p-6 rounded-md shadow-md">
      <Typography
  variant="h4"
  className="text-center mb-12"
  style={{
    fontWeight: 'bold',  
    color: 'white',   
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', 
  }}
>
  Historial de créditos
</Typography>

      {Object.keys(solicitudesUsuario).length > 0 ? (
        <div className='mt-4'>
          {Object.entries(ordenarSolicitudesPorFecha()).map(([solicitudId, solicitud]) => (
            <div key={solicitudId} className="mb-4 bg-white p-6 rounded-md shadow-md hover:shadow-lg">
              <Typography variant="subtitle1" className="font-semibold text-lg mb-7" style={poppinsFont}>
              ◦ Número de solicitud: {solicitudId}
              </Typography>
              <Typography variant="body2" style={poppinsFont}>
              ◦ Monto: {solicitud.monto.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </Typography>
              <Typography variant="body2" style={poppinsFont}>
              ◦ Plazo: {solicitud.plazo.dias} días
              </Typography>
              <Typography variant="body2" style={poppinsFont}>
              ◦ Fecha de Vencimiento:{new Date(solicitud.dateObjectFechaVencimiento.seconds * 1000).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" style={poppinsFont}>
              ◦ Intereses: {solicitud.intereses.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </Typography>
              <Typography variant="body2" style={poppinsFont}>
              ◦ Aval: {solicitud.aval.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </Typography>
              <Typography variant="body2" style={poppinsFont}>
              ◦ Total a Pagar: {solicitud.totalAPagar.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </Typography>
              <Typography
                  variant="body2"
                  style={Object.assign({}, poppinsFont, {
                    color: solicitud.estado.toLowerCase() === 'solicitud enviada' ? '#1a4ad9' :
                      (solicitud.estado.toLowerCase() === 'en revisión' ? '#FFD700' :
                        (solicitud.estado.toLowerCase() === 'aprobada' ? '#5cc93a' :
                          (solicitud.estado.toLowerCase() === 'negada' ? '#FF0000' :
                            (solicitud.estado.toLowerCase() === 'pagada' ? '#c40ea0' :
                              (solicitud.estado.toLowerCase() === 'en mora' ? '#1a4ad9' :
                                (solicitud.estado.toLowerCase() === 'novado' ? '#b05412' :
                                  (solicitud.estado.toLowerCase() === 'desembolsado' ? '#c40ea0' : 'black'))
                              )
                            )
                          )
                        )
                      )
                  })}
                >
              • Estado: {solicitud.estado}
            </Typography>
              <Typography variant="body2" style={poppinsFont}>
              ◦ Fecha de Solicitud: {new Date(solicitud.dateObjectSolicitud.seconds * 1000).toLocaleDateString()}
              </Typography>
            </div>
          ))}
        </div>
      ) : (
        <Typography variant="body1" style={{ fontWeight: 3 }}>
          No hay solicitudes de crédito para este usuario.
        </Typography>
      )}
    </div>
  );
};
export default UserLoanList;
