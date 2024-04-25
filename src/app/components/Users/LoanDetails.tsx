import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useSession } from 'next-auth/react';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Swal from 'sweetalert2';
import CardContent from '@mui/material/CardContent';

interface LoanDetailsProps {
  amount: number;
  term: number;
  redirectToMain: () => void;
}

const montserratFont = {
  fontFamily: 'Montserrat, sans-serif',
};

const LoanDetails: React.FC<LoanDetailsProps> = ({ amount, term, redirectToMain }) => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

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

  const calculateDueDate = () => {
    const currentDate = new Date();
    const dueDate = new Date(currentDate.setDate(currentDate.getDate() + term));
    return dueDate.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const fechaActual = new Date();
  
  const fechaSolicitudString = fechaActual.toLocaleString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

  const fechaSolicitudDate = fechaActual;

  const handleSolicitarCredito = async () => {
    if (status === 'authenticated' && session?.user?.email) {
      try {
        const userSolicitudesCollectionRef = collection(db, 'solicitudes_credito');
        const userDocRef = doc(userSolicitudesCollectionRef, session.user.email);

        const usuarioDocRef = doc(db, 'usuarios', session.user.email);
        const usuarioDocSnap = await getDoc(usuarioDocRef);

        const datosUsuario = usuarioDocSnap.data();

        const currentDate = new Date();
        const dueDate = new Date(currentDate.setDate(currentDate.getDate() + term));
        const mora = 0;
        const cobranza = 0;
        
        await setDoc(
          userDocRef,
          {
            solicitudes: {
              [Date.now()]: {
                monto: amount,
                plazo: {
                  dias: term,
                  fechaVencimiento: calculateDueDate(),
                },
                intereses: calculateInterest(),
                firma: calculateFirma(),
                descuento:calculateDescuento(),
                aval: calculateAval(),
                totalAPagar: Number(calculateTotal()),
                estado: 'Solicitud Enviada',
                datosUsuario,
                fechaSolicitud: fechaSolicitudString,
                dateObjectSolicitud: fechaSolicitudDate,
                dateObjectFechaVencimiento: dueDate,
                mora,
                cobranza,
              },
            },
          },
          { merge: true }
        );

        Swal.fire({
          icon: 'success',
          title: '¡Solicitud enviada con éxito!',
          text: 'Te estaremos contactando para darte una respuesta.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            // Llama a la función de redirección
            redirectToMain();
          }
        });

        console.log('Solicitud de crédito enviada con éxito');
      } catch (error) {
        console.error('Error al enviar la solicitud de crédito:', error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center text-black text-lg font-medium bg-white p-8 rounded-lg w-full mt-[-6rem]">
      <div className="w-full">
        <div className="mb-4">
          <Typography gutterBottom className="mt-10 text-xl font-medium text-indigo-900" style={montserratFont}>
            Monto del crédito:
          </Typography>
          <Typography variant="h5" className="text-xl md:text-2xl font-bold text-a4e786">
            {amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
          </Typography>
        </div>

        <div className="mb-5">
          <Typography gutterBottom className="text-xl font-medium text-indigo-900" style={montserratFont}>
            Plazo del crédito:
          </Typography>
          <Typography variant="h5" className="text-xl md:text-2xl font-bold text-a4e786">
            {term} días ({calculateDueDate()})
          </Typography>
        </div>

        <div className="mb-4">
          <Typography gutterBottom className="mt-8 text-xl font-medium text-indigo-900" style={montserratFont}>
            Detalles financieros:
          </Typography>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Typography variant="body2" className="text-a4e786">
                - Intereses:
              </Typography>
              <Typography variant="body2" className="text-a4e786">
                - Aval:
              </Typography>
              <Typography variant="body2" className="text-a4e786">
                - Firma:
              </Typography>
              <Typography variant="body2" className="text-a4e786">
                - Descuento:
              </Typography>
            </div>
            <div className="text-right">
              <Typography variant="body2" className="text-a4e786">
                {calculateInterest().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </Typography>
              <Typography variant="body2" className="text-a4e786">
                {calculateAval().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </Typography>
              <Typography variant="body2" className="text-a4e786">
                {calculateFirma().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </Typography>
              <Typography variant="body2" className="text-a4e786">
                {calculateDescuento().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </Typography>
            </div>
          </div>
        </div>

        <Divider
          variant="fullWidth"
          className="mb-8"
          style={{
            backgroundImage: 'linear-gradient(to right, #130454, #2906c7)',
            height: '2px',
            borderRadius: '4px',
          }}
        />

        <div className="mb-4">
          <Typography variant="body1" className="text-indigo-900 mb-5">
            Total a pagar:
          </Typography>
          <Typography variant="h6" className="text-xl md:text-xl font-mono text-a4e786">
            {Number(calculateTotal()).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }).replace('COP', '$')}
          </Typography>
        </div>

        <div className="flex justify-center items-center text-center md:text-left mt-4">
          <Button
            onClick={handleSolicitarCredito}
            variant="contained"
            style={{ backgroundColor: '#2f0185', color: '#ffffff' }}
            color="primary"
          >
            Solicitar crédito
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;
