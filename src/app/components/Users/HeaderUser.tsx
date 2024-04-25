import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Dialog, Popover, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import UserData from './Userdata';

interface SolicitudCredito {
  estado: string;
  dateObjectSolicitud: {
    seconds: number;
    nanoseconds: number;
  };
}

const HeaderUser: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [hasCreditRequest, setHasCreditRequest] = useState(false);
  const [hasUnpaidLoan, setHasUnpaidLoan] = useState(false);
  const [isEligibleToRequestCredit, setIsEligibleToRequestCredit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState<Set<string>>(new Set<string>());
  const [defaultActiveTab, setDefaultActiveTab] = useState<string>('BÁSICOS');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<UserData | null>(null);
  const [hasEditedOnce, setHasEditedOnce] = useState(false);
  const [hasUpdatedInformation, setHasUpdatedInformation] = useState(false);
  const [hasUncompletedForm, setHasUncompletedForm] = useState<boolean>(false);


  const isFormCompleted = (data: UserData | null): boolean => {
    if (!data) return false; 

    const requiredFields = [
      'Nombres', 'Apellidos', 'documentoId', 'email', 'telefono', 'fechaExpedicion',
      'departamentoExpedicion', 'ciudadExpedicion', 'fechaNacimiento', 'departamentoNacimiento',
      'ciudadNacimiento', 'estadoCivil', 'sexo', 'nivelEstudios', 'direccion', 'departamentoResidencia',
      'ciudadResidencia', 'tipoVivienda', 'tiempoPermanencia', 'personasACargo', 'tipoTrabajador',
      'actividadLaboral', 'tiempoActividadComercial', 'ingresosMensuales', 'gastosMensuales',
      'entidadBancaria', 'tipoCuenta', 'numeroCuenta', 'nombresReferencia', 'apellidosReferencia',
      'departamentoReferencia', 'ciudadReferencia', 'telefonoReferencia'
    ];

    return requiredFields.every(field => data[field] && data[field].trim() !== '');
  };

  const checkCreditRequest = async () => {
    try {
      if (session?.user?.email) {
        const solicitudesCreditoCollectionRef = collection(db, 'solicitudes_credito');
        const solicitudesCreditoSnapshot = await getDocs(solicitudesCreditoCollectionRef);
        const userIdsInSolicitudes = solicitudesCreditoSnapshot.docs.map((doc) => doc.id);

        setHasCreditRequest(userIdsInSolicitudes.includes(session.user.email));
      }
    } catch (error) {
      console.error('Error al verificar las solicitudes de crédito:', error);
    }
  };

  const checkUnpaidLoan = async () => {
    try {
      if (status === 'authenticated' && session?.user?.email) {
        const userSolicitudesCollectionRef = collection(db, 'solicitudes_credito');
        const userDocRef = doc(userSolicitudesCollectionRef, session.user.email);

        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const solicitudesUsuarioData = userDocSnap.data().solicitudes;
          const solicitudesArray = Object.values(solicitudesUsuarioData) as SolicitudCredito[];

          solicitudesArray.sort(
            (a, b) =>
              b.dateObjectSolicitud.seconds - a.dateObjectSolicitud.seconds || b.dateObjectSolicitud.nanoseconds - a.dateObjectSolicitud.nanoseconds
          );

          const creditoActual = solicitudesArray.length > 0 ? solicitudesArray[0] : null;
          setHasUnpaidLoan(creditoActual?.estado !== 'Pagada');

    
          const fechaNegacion = creditoActual?.dateObjectSolicitud?.seconds || 0;
          const dosMesesEnSegundos = 60 * 60 * 24 * 30 * 2;

          setIsEligibleToRequestCredit(Date.now() / 1000 - fechaNegacion > dosMesesEnSegundos);
        }
      }
    } catch (error) {
      console.error('Error al consultar el último crédito del usuario:', error);
    }
  };
  

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const userDoc = await getDoc(doc(collection(db, 'usuarios'), session.user.email));
          if (userDoc.exists()) {
            const userDataFromFirestore = userDoc.data() as UserData;
            setUserData(userDataFromFirestore);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkCreditRequest();
    checkUnpaidLoan();

    fetchUserData();
  }, [status, session]);
  
  useEffect(() => {
    setActiveTabs(new Set([defaultActiveTab]));
  }, [defaultActiveTab]);

  useEffect(() => {
    // Actualizar el estado del formulario cuando cambie userData
    setFormState(userData);
  }, [userData]);

  useEffect(() => {
    // Update the variable to reflect the opposite of isFormCompleted
    setHasUncompletedForm(!isFormCompleted(formState));
  }, [formState]);

  console.log(hasUncompletedForm, 'Header')


  return (
    <header className="bg-white shadow-md hover:shadow-lg transition duration-300 ease-in-out rounded-lg overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        {/* Logo y nombre de la aplicación */}
        <div className="flex lg:flex-1 items-center space-x-3 rtl:space-x-reverse">
          <a href="/" className="flex items-center">
            <img src="img/Perfiles2.webp" className="h-8" alt="Flowbite Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white ml-2">
              <span style={{ color: 'rgb(0,150,255)' }}>Easy</span>
              <span style={{ color: 'rgb(88,0,255)' }}>Credit</span>
            </span>
          </a>
        </div>

        {/* Botón de menú para dispositivos móviles */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Abrir menú principal</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Opciones de navegación en dispositivos grandes */}
        <Popover.Group className="hidden lg:flex lg:gap-x-12">
          <Link href="/" className="text-md font-semibold leading-5 text-gray-900 hover:text-indigo-600">
            Inicio
          </Link>
          {hasUnpaidLoan || !isFormCompleted(userData) ? (
            <span className="text-md font-semibold leading-5 text-gray-300 cursor-not-allowed">
              Solicitar Crédito
            </span>
          ) : (
            <Link
              href="/request-credit"
              className={`text-md font-semibold leading-5 text-gray-900 hover:text-indigo-600`}
            >
              Solicitar Crédito
            </Link>
          )}
          {hasCreditRequest ? (
            <Link href="/my-credit" className="text-md font-semibold leading-5 text-gray-900 hover:text-indigo-600">
              Mis Créditos
            </Link>
          ) : (
            <span className="text-md font-semibold leading-5 text-gray-300 cursor-not-allowed">
              Mis Créditos
            </span>
          )}
        </Popover.Group>

        {/* Sección de usuario en dispositivos grandes */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center space-x-4">
          {session?.user && (
            <>
              <span className="text-sm font-semibold leading-5 text-gray-900">{session.user.email}</span>

              <Link href="/forgot-password" passHref>
                <div title="" style={{ cursor: 'pointer' }}>
                  <Icon icon="mingcute:user-4-fill" color="#30008a" width="24" height="24" />
                  <style jsx>{`
                    [title=""]:hover:after {
                      content: "Cambiar contraseña";
                      display: inline-block;
                      position: absolute;
                      padding: 8px;
                      background-color: #72FFFF;
                      color: #30008a;
                      font-size: 14px;
                      border-radius: 4px;
                      margin-top: 18px; /* Ajusta según sea necesario */
                      margin-left: 5px; /* Ajusta según sea necesario */
                      white-space: nowrap;
                    }
                  `}</style>
                </div>
              </Link>

              <button
                className="bg-white border-2 border-slate-100 hover:bg-red-500 hover:text-white text-indigo-500 font-bold py-1 px-3 rounded ml-4 text-sm"
                onClick={() => signOut()}
              >
                Salir 🚫
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Menú desplegable para dispositivos móviles */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">

          {/* Cabecera del menú desplegable */}
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <img className="h-12 w-auto" src="img/Logotipo-Principal.webp" alt="" />
            </Link>

            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Cerrar menú</span>
              <XMarkIcon className="h-8 w-8" aria-hidden="true" />
            </button>
          </div>

          {/* Contenido del menú desplegable */}
          <div className="mt-6 flow-root">
            {session?.user && (
              <div className="text-center">
                <span className="text-lg font-bold leading-5 text-gray-900">{session.user.email}</span>
              </div>
            )}

            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {/* Opciones de navegación en el menú desplegable */}
                <Link href="/" className="-mx-3 mt-10 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 text-md">
                  Inicio
                </Link>
                {hasUnpaidLoan || !isFormCompleted(userData) ? (

                  <span className="text-md font-semibold leading-5 text-gray-300 cursor-not-allowed">
                    Solicitar Crédito
                  </span>
                ) : (
                  <Link
                    href="/request-credit"
                    className={`text-md font-semibold leading-5 text-gray-900 hover:text-indigo-600`}
                  >
                    Solicitar Crédito
                  </Link>
                )}
                {hasCreditRequest ? (
                  <Link href="/my-credit" className="-mx-3 mt-10 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 text-md">
                    Mis Créditos
                  </Link>
                ) : (
                  <span className="-mx-3 mt-10 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-300 cursor-not-allowed">
                    Mis Créditos
                  </span>
                )}
              </div>

              {/* Botón de cerrar sesión en el menú desplegable */}
              <div className="py-6 flex justify-center">
                <button
                  className="bg-white border-2 border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-bold py-1 px-3 rounded text-md"
                  onClick={() => signOut()}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default HeaderUser;