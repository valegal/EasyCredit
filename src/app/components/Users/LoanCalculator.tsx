import React, { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import LoanDetails from './LoanDetails';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const montserratFont = {
  fontFamily: 'Montserrat, sans-serif',
};

const sliderStyle = {
  borderRadius: '30px',
  color: '#7f64f5',
  '& .MuiSliderThumb': {
    height: 100,
    width: 20,
  },
  height: 15,
};

const LoanCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number>(200000);
  const [term, setTerm] = useState<number>(7);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [maxAmount, setMaxAmount] = useState<number>(200000);
  const { data: session } = useSession();
  const router = useRouter();

  const redirectToMain = () => {
    router.push('/');
    // console.log('Redirigiendo a la ruta principal');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleTermChange = (event: Event, value: number | number[]) => {
    const selectedTerm = value as number;
    const newTerm = selectedTerm < 7 ? 7 : selectedTerm;
    setTerm(newTerm);

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + newTerm);
    setSelectedDate(newDate);
  };

  const fetchSolicitudesCredito = async () => {
    try {
      const solicitudesCreditoCollectionRef = collection(db, 'solicitudes_credito');
      const solicitudesCreditoSnapshot = await getDocs(solicitudesCreditoCollectionRef);
      const userIdsInSolicitudes = solicitudesCreditoSnapshot.docs.map(doc => doc.id);

      // Proporcionar un valor predeterminado para session
      const currentUserEmail = session?.user?.email ?? '';

      if (userIdsInSolicitudes.includes(currentUserEmail)) {
        

        // Obtener el tope del usuario actual
        const currentUserDoc = solicitudesCreditoSnapshot.docs.find(doc => doc.id === currentUserEmail);
        const currentUserTope = currentUserDoc?.data()?.tope;
        setMaxAmount(currentUserTope || 200000);
        // console.log('Tope del usuario actual:', currentUserTope);
      } else {
        setMaxAmount(200000);

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 6000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });

        Toast.fire({
          icon: 'info',
          title: '¿Es tu primer crédito?',
          text: 'Te prestamos hasta un máximo de $200.000',
          color: '#145369',
        });
      }
    } catch (error) {
      console.error('Error al obtener las solicitudes de crédito:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchSolicitudesCredito();
    }
  }, [session]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-a4e786">
      <div className="container mx-auto flex flex-col md:flex-row w-full h-full md:h-[600px]">
        <div className="bg-white w-full md:w-1/2 md:mb-0 p-4 md:p-0 mt-8 md:mt-0">
          <h2 className="text-4xl text-indigo-950 font-semibold mb-8 md:mb-12 text-center">
            Solicita tu crédito
          </h2>
          <div className="bg-white p-9 md:p-12 rounded-xl shadow-xl w-full">
            <div className="mb-12">
              <div className='mb-5'>
                <Typography gutterBottom className="mt-5 text-xl font-medium text-indigo-900" style={montserratFont}>
                  ¿Cuánto dinero necesitas?
                  <span className="text-2xl text-a4e786 font-semibold ml-8">
                    {amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                  </span>
                </Typography>
              </div>
              <Slider
                value={amount}
                onChange={(event, value) => setAmount(value as number)}
                step={10000}
                marks={[
                  { value: 100000, label: '$100,000' },
                  // { value: 400000, label: '$400,000' },
                  // { value: 750000, label: '$750,000' },
                  { value: maxAmount, label: `$${maxAmount.toLocaleString()}` },
                ]}
                min={100000}
                max={maxAmount}
                valueLabelDisplay="auto"
                style={sliderStyle}
                valueLabelFormat={(value) => `$${value.toLocaleString()}`}
              />
            </div>
            <div className="mb-12">
              <div className='mb-6'>
                <div className='mb-2'>
                  <Typography gutterBottom className="mt-5 text-xl font-medium text-indigo-900" style={montserratFont}>
                    ¿Cuándo puedes pagarlo?
                  </Typography>
                </div>
                <Typography variant="subtitle1" gutterBottom className="text-base text-indigo-900 text-center">
                  {formatDate(selectedDate)}
                </Typography>
              </div>
              <Slider
                value={term}
                onChange={handleTermChange}
                min={7}
                max={30}
                style={sliderStyle}
                valueLabelDisplay="auto"
                marks={[
                  { value: 7, label: '7 días' },
                  { value: 12, label: '12 días' },
                  { value: 18, label: '18 días' },
                  { value: 24, label: '24 días' },
                  { value: 30, label: '30 días' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="hidden md:block w-10"></div>

        <div className="rounded-xl w-full md:w-1/2 md:order-1 mt-16 md:mt-0"> 
          <h2 className="text-4xl text-indigo-950 font-semibold mb-6 text-center">
            Detalles del Crédito
          </h2>
          <div className="bg-white p-5 md:p-12 mt-12 rounded-xl shadow-xl w-full">
            <LoanDetails amount={amount} term={term} redirectToMain={redirectToMain} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
