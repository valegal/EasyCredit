import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Swal from 'sweetalert2';
import { addDays, format } from 'date-fns';

interface SolicitudCredito {
  id: string
  monto: number;
  plazo: {
    dias: number;
    fechaVencimiento: string;
  };
  intereses: number;
  aval: number;
  firma: number;
  descuento: number;
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
  mora: number;
  cobranza: number;
}

const interFont = {
  fontFamily: 'Inter, sans-serif',
  color: '#131338',
};

const calculoDiasMora = (dateObjectFechaVencimiento: { seconds: number, nanoseconds: number }) => {
  const today = new Date();
  const fechavencimiento = new Date(dateObjectFechaVencimiento.seconds * 1000);

  const daysDifference = Math.floor((today.getTime() - fechavencimiento.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(daysDifference, 0);
};

const CurrentLoanInfo: React.FC = () => {

  const { data: session, status } = useSession();
  const [latestLoan, setLatestLoan] = useState<SolicitudCredito | null>(null);



  const actualizarEstadoEnMora = async (usuarioEmail: string, solicitudId: string) => {
    // console.log('Entrando en la función actualizarEstadoEnMora');
    // console.log('Usuario Email:', usuarioEmail);
    // console.log('Solicitud ID:', solicitudId);

    try {
      const userSolicitudesCollectionRef = collection(db, 'solicitudes_credito');
      const userDocRef = doc(userSolicitudesCollectionRef, usuarioEmail);

      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const solicitudesUsuarioData = userDocSnap.data().solicitudes;

        if (solicitudesUsuarioData[solicitudId]) {
          solicitudesUsuarioData[solicitudId].estado = 'En Mora';

          await updateDoc(userDocRef, {
            solicitudes: solicitudesUsuarioData,
          });

          console.log('Actualización exitosa a "En Mora"');
        }
      }
    } catch (error) {
      console.error('Error al actualizar el estado del crédito a "En Mora":', error);
    }
  };



  useEffect(() => {
    const consultarUltimoCredito = async () => {
      try {
        if (status === 'authenticated' && session?.user?.email) {
          const userSolicitudesCollectionRef = collection(db, 'solicitudes_credito');
          const userDocRef = doc(userSolicitudesCollectionRef, session.user.email);

          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const solicitudesUsuarioData: any = userDocSnap.data().solicitudes;
            const solicitudesArray = Object.entries(solicitudesUsuarioData).map(([id, solicitud]) => ({ ...(solicitud as SolicitudCredito), id })) as SolicitudCredito[];

            solicitudesArray.sort(
              (a, b) => b.dateObjectSolicitud.seconds - a.dateObjectSolicitud.seconds || b.dateObjectSolicitud.nanoseconds - a.dateObjectSolicitud.nanoseconds
            );

            const creditoActual = solicitudesArray.length > 0 ? solicitudesArray[0] : null;
            setLatestLoan(creditoActual);

            if (creditoActual) {
              const daysOfDelay = calculoDiasMora(creditoActual.dateObjectFechaVencimiento);

              // console.log("Dias de Mora", daysOfDelay)

              // Actualizar estado solo si no está pagada
              if (creditoActual.estado.toLowerCase() !== 'pagada') {

                if (daysOfDelay > 0) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Estás en mora',
                    iconColor: '#f00000',
                    text: `Tienes ${daysOfDelay} día(s) de mora. `,
                    showConfirmButton: false,
                    footer: `Cómunicate a las lineas de atención para realizar el pago`,
                    timer: 8000,
                    timerProgressBar: true,
                    position: 'top-end',
                    toast: true,
                    didOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    },
                  });

                  actualizarEstadoEnMora(session.user.email, creditoActual.id);
                }
              }

              if (creditoActual.estado.toLowerCase() === 'novado') {
                // Generar un ID único basado en la fecha actual
                const newId = new Date().getTime().toString();
                
                // Obtener la fecha de vencimiento de la solicitud actual
                const vencimientoDate = new Date(creditoActual.dateObjectFechaVencimiento.seconds * 1000);
                // Agregar 30 días a la fecha de vencimiento de la solicitud actual
                const vencimientoModificado = addDays(vencimientoDate, 30);
                
                // Crear un objeto Timestamp de Firebase a partir de la fecha modificada
                const timestampVencimiento = Timestamp.fromDate(vencimientoModificado);
                
                const solicitudDate = new Date(creditoActual.dateObjectSolicitud.seconds * 1000);
                // Agregar 5 minutos a la fecha de la solicitud actual
                solicitudDate.setMinutes(solicitudDate.getMinutes() + 5);
                
                // Establecer el plazo en 30 días
                const nuevoPlazo = 30;
                
                // Calcular los datos necesarios
                const amount = creditoActual.monto;
                const term = nuevoPlazo;
                const calculateInterest = () => amount * ((0.35 / 360) * term);
                const calculateAval = () => amount * 0.2222;
                const calculateFirma = () => 155000;
                const calculateDescuento = () => {
                  const procesoDescuento = 0.83 + ((7 - term) * 0.01);
                  return calculateFirma() * procesoDescuento;
                };
                const calculateTotal = () => {
                  const total = (Math.ceil((amount + calculateInterest() + calculateAval() + calculateFirma() - calculateDescuento()) / 100) * 100).toFixed(2);
                  return total;
                };
                
                // Crear una nueva fecha de vencimiento sumando 30 días a la fecha actual
                const nuevaFechaVencimiento = addDays(new Date(), nuevoPlazo);
                
                const fechaVencimientoString = format(nuevaFechaVencimiento, 'yyyy-MM-dd');
                
                const timestamp = Timestamp.fromDate(solicitudDate);
                
                const copiaSolicitud = {
                  ...creditoActual,
                  id: newId,
                  dateObjectSolicitud: timestamp, // Usar el objeto Timestamp modificado
                  dateObjectFechaVencimiento: timestampVencimiento,
                  estado: 'Desembolsado',
                  plazo: {
                    dias: nuevoPlazo, // Establecer los días en 30
                    fechaVencimiento: fechaVencimientoString,
                  },
                  // Agregar los datos calculados
                  intereses: calculateInterest(),
                  aval: calculateAval(),
                  firma: calculateFirma(),
                  descuento: calculateDescuento(),
                  totalAPagar: Number(calculateTotal()),
                };
              
                solicitudesUsuarioData[copiaSolicitud.id] = copiaSolicitud;
                await updateDoc(userDocRef, {
                  solicitudes: solicitudesUsuarioData,
                });
              
                // Notificar al usuario sobre la copia creada
                Swal.fire({
                  icon: 'success',
                  title: 'Solicitud Novada',
                  text: 'Se ha creado una copia de la solicitud actual.',
                });
              }

            }
          }
        }
      } catch (error) {
        console.error('Error al consultar el último crédito del usuario:', error);
      }
    };

    consultarUltimoCredito();
  }, [status, session]);


  const calculateTotalBasedOnDifference = (amount: number, term: number, dateObjectSolicitud: { seconds: number, nanoseconds: number }, mora: number, cobranza: number) => {
    const fechaSolicitud = new Date(dateObjectSolicitud.seconds * 1000);
    const today = new Date();
    const daysDifference = Math.floor((today.getTime() - fechaSolicitud.getTime()) / (1000 * 60 * 60 * 24));

    // console.log(daysDifference)
    const calculateInterest = () => amount * ((0.35 / 360) * daysDifference);
    const calculateAval = () => amount * 0.2222;
    const calculateFirma = () => 155000;
    const calculateDescuento = () => {
      const procesoDescuento = 0.83 + ((7 - daysDifference) * 0.01);
      return calculateFirma() * procesoDescuento;
    };

    const total = (Math.ceil((amount + calculateInterest() + calculateAval() + calculateFirma() - calculateDescuento() + mora + cobranza) / 100) * 100).toFixed(2);
    return total;
  };

  const isSevenDaysBefore = () => {
    if (latestLoan) {
      const today = new Date();
      const fechaVencimiento = new Date(latestLoan.dateObjectFechaVencimiento.seconds * 1000);
      const sevenDaysBefore = new Date(fechaVencimiento);
      sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
      return today >= sevenDaysBefore && today < fechaVencimiento;
    }
    return false;
  };

  const handleObtenerMasPlazo = () => {
    if (latestLoan) {
      const { intereses, aval, firma, descuento } = latestLoan;

      const valorSolicitud = intereses + aval + firma - descuento;
      const valorRedondeado = Math.ceil(valorSolicitud / 100) * 100;

      Swal.fire({
        icon: 'info',
        title: 'Te daremos 30 días más de plazo',
        html: `
          <p>Para obtener 30 días más de plazo debes pagar:</p>
          <ul>
            <li>Aval: ${Math.ceil(aval / 100) * 100}</li>
            <li>Intereses: ${Math.ceil(intereses / 100) * 100}</li>
            <li>Firma electrónica: ${Math.ceil(firma / 100) * 100}</li>
            <li>Descuento: - ${Math.ceil(descuento / 100) * 100}</li>
          </ul>
          
          <p>Total a pagar: ${valorRedondeado.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
        `,
        footer: `
          <p>Para hacer efectiva la solicitud Envíanos el comprobante de pago a nuestros números con tu Número de solicitud, tu nombre y número de cédula.</p>
        `,
      });
    }
  };



  return (
    <div className="border p-4 rounded-md shadow-xl hover:shadow-credimonto-green hover:shadow-lg bg-white">
      <Typography variant="h4" className="text-center text-2xl md:text-3xl font-bold text-gray-800 mb-8"
        style={{
          fontWeight: 'bold',
          color: '#131338',
        }}>
        Tu crédito actual
      </Typography>

      {latestLoan ? (
        <div className='mt-4'>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <TableRow label="Número de solicitud" value={latestLoan.id} />
              <TableRow label="Monto" value={latestLoan.monto.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} />
              <TableRow label="Plazo" value={`${latestLoan.plazo.dias} días`} />
              {/* <TableRow label="Fecha de Vencimiento" value={latestLoan.plazo.fechaVencimiento} /> */}
              <TableRow
                label="Fecha de Vencimiento"
                value={new Date(latestLoan.dateObjectFechaVencimiento.seconds * 1000).toLocaleDateString()}
              />
              <TableRow label="Intereses" value={latestLoan.intereses.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} />
              <TableRow label="Firma" value={latestLoan.firma.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} />
              <TableRow label="Descuento" value={latestLoan.descuento.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} />
              <TableRow label="Aval" value={latestLoan.aval.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} />
              <TableRow
                label="Días de Mora"
                value={
                  latestLoan.estado.toLowerCase() === 'pagada'
                    ? 'Crédito pagado'
                    : calculoDiasMora(latestLoan.dateObjectFechaVencimiento).toString()
                }
              />
              <TableRow label="Mora" value={latestLoan.mora.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} />
              <TableRow label="Cobranza" value={latestLoan.cobranza.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} />

              <TableRow label="Total a Pagar (Fecha vencimiento)" value={latestLoan.totalAPagar.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} />

              <TableRow
                label="Total a Pagar (El día de hoy)"
                value={
                  latestLoan.estado.toLowerCase() === 'pagada'
                    ? 'Crédito pagado'
                    : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(
                      Number(
                        calculateTotalBasedOnDifference(
                          latestLoan.monto,
                          latestLoan.plazo.dias,
                          latestLoan.dateObjectSolicitud,
                          latestLoan.mora,
                          latestLoan.cobranza
                        )
                      )
                    )
                }
              />




              <TableRow
                label="Estado"
                value={latestLoan.estado}
                color={
                  latestLoan.estado.toLowerCase() === 'solicitud enviada'
                    ? '#1a4ad9'
                    : latestLoan.estado.toLowerCase() === 'en revisión'
                      ? '#FFD700'
                      : latestLoan.estado.toLowerCase() === 'aprobada'
                        ? '#5cc93a'
                        : latestLoan.estado.toLowerCase() === 'negada'
                          ? '#FF0000'
                          : latestLoan.estado.toLowerCase() === 'pagada'
                            ? '#c40ea0'
                            : latestLoan.estado.toLowerCase() === 'en mora'
                              ? '#c40ea0'
                              : latestLoan.estado.toLowerCase() === 'novado'
                                ? '#b05412'
                                : latestLoan.estado.toLowerCase() === 'desembolsado'
                                  ? '#c40ea0'
                                  : 'black'

                }
              />
              {/* <TableRow label="Fecha de solicitud" value={latestLoan.fechaSolicitud} /> */}
              <TableRow
                label="Fecha de Solicitud"
                value={new Date(latestLoan.dateObjectSolicitud.seconds * 1000).toLocaleDateString()}
              />
              <TableRow
                label="Obtener más plazo"
                value={
                  isSevenDaysBefore() && latestLoan.estado.toLowerCase() === 'desembolsado' ? (
                    <button
                      onClick={handleObtenerMasPlazo}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Obtener más plazo
                    </button>
                  ) : 'No disponible'
                }
              />
            </tbody>
          </table>
        </div>
      ) : (
        <Typography variant="body1" style={interFont}>
          No hay créditos solicitados por este usuario.
        </Typography>
      )}
    </div>
  );
};

interface TableRowProps {
  label: string;
  value: string | JSX.Element;
  color?: string;
}

const TableRow: React.FC<TableRowProps> = ({ label, value, color }) => (
  <tr>
    <td style={{ ...interFont, fontWeight: 'bold', padding: '8px', border: '1px solid #ddd' }}>{label}</td>
    <td style={{ ...interFont, color, padding: '8px', border: '1px solid #ddd' }}>{value}</td>
  </tr>
);

export default CurrentLoanInfo;
