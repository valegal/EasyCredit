import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getFirestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Loading from '@/app/components/Loading';
import { Icon } from '@iconify/react';
import AccordionTab from './AccordionTab';
import Swal from 'sweetalert2';

interface UserData {
  [key: string]: string;
}

interface Tab {
  id: string;
  title: string;
  description: string;
  fields: Array<{ label: string; id: string }>;
}


const UserData: React.FC = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState<Set<string>>(new Set<string>());
  const [defaultActiveTab, setDefaultActiveTab] = useState<string>('BÁSICOS');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<UserData | null>(null);
  const [hasEditedOnce, setHasEditedOnce] = useState(false);
  const [hasUpdatedInformation, setHasUpdatedInformation] = useState(false);
  const [hasUncompletedForm, setHasUncompletedForm] = useState<boolean>(false);
  const [refreshUserData, setRefreshUserData] = useState(false);

  // Crea una función para activar el refresco del componente UserData
const handleRefreshUserData = () => {
  setRefreshUserData(prevState => !prevState);
};

 
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
  

  const handleTabClick = (tabId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const isClickInsideInput = (e.target as HTMLElement).tagName === 'INPUT';

    if (!isClickInsideInput) {
      if (isEditing && isSaving) {
        return;
      }

      const updatedActiveTabs = new Set(activeTabs);

      if (updatedActiveTabs.has(tabId)) {
        updatedActiveTabs.delete(tabId);
      } else {
        updatedActiveTabs.add(tabId);
      }

      setActiveTabs(updatedActiveTabs);
    }
  };

  const onUpdateField = async (tabId: string, field: string, value: string) => {
    if (!session?.user?.email) {
      console.error('No user email found in session.');
      return;
    }

    const isRestrictedField = ['Número de documento'].includes(field);

    if (isRestrictedField && isEditing) {
      console.log(`Editing ${field} is restricted.`);
      return;
    }

    setUserData((prevUserData) => ({
      ...prevUserData,
      [field]: value,
    }));

    try {
      if (!isRestrictedField) {
        const userDocRef = doc(collection(db, 'usuarios'), session.user.email);
        await setDoc(userDocRef, { [field]: value }, { merge: true });
      }
    } catch (error) {
      console.error(`Error updating/creating field "${field}" in Firebase:`, error);
    }
  
  };



  const handleUpdateInformation = () => {
    if (!hasEditedOnce) {
      Swal.fire({
        icon: 'info',
        title: '¡Atención!',
        text: 'El usuario solo puede editar ciertos campos una vez.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });

      setHasEditedOnce(true);
    }

    setIsEditing(true);
    console.log('Modo de edición activado.');
  };

  const handleSave = async () => {
    if (!isFormCompleted(formState)) {
      // Si el formulario no está completo, muestra un mensaje de advertencia
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos para habilitar la pestaña "Solicitar Crédito".',
        confirmButtonColor: '#131338', 
        confirmButtonText: 'Continuar editando',
        showCancelButton: true,
        cancelButtonColor: '#FACEA8', 
        cancelButtonText: 'Completar más tarde',
      }).then((result) => {
        if (result.isConfirmed) {
          
          return;
        } else {
          
          saveChanges();
        }
      });
      return; 
    }
  
    saveChanges();
  };
  
  const saveChanges = async () => {
    try {
      if (!session?.user?.email) {
        console.error('No user email found in session.');
        return;
      }
  
      const userDocRef = doc(collection(db, 'usuarios'), session.user.email);
      await setDoc(userDocRef, userData, { merge: true });
  
      if (!hasUpdatedInformation) {
        Swal.fire({
          icon: 'success',
          title: '¡Datos actualizados correctamente!',
          text: 'Puedes realizar más ediciones si es necesario.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
  
        setHasUpdatedInformation(true);
      }
    } catch (error) {
      console.error('Error al guardar la información:', error);
    } finally {
      setIsEditing(false);
      setIsSaving(false);
    }
  };
  
  

  const handleCancel = () => {
    console.log('Edición cancelada.');
    setIsEditing(false);
  };

  if (loading) {
    return <Loading />;
  }

  const tabs: Tab[] = [
    {
      id: 'BÁSICOS',
      title: 'Datos Básicos',
      description: 'Esta sección recopila información básica del solicitante del crédito.',
      fields: [
        { label: 'Nombres', id: 'Nombres' },
        { label: 'Apellidos', id: 'Apellidos' },
        { label: 'Número de documento', id: 'documentoId' },
        { label: 'Teléfono', id: 'telefono' },
        { label: 'Correo Electrónico', id: 'email' },
        { label: 'Fecha de expedición', id: 'fechaExpedicion' },
        { label: 'Departamento de expedición', id: 'departamentoExpedicion' },
        { label: 'Ciudad de expedición', id: 'ciudadExpedicion' },
        { label: 'Fecha de nacimiento', id: 'fechaNacimiento' },
        { label: 'Departamento de nacimiento', id: 'departamentoNacimiento' },
        { label: 'Ciudad de nacimiento', id: 'ciudadNacimiento' },
        { label: 'Estado civil', id: 'estadoCivil' },
        { label: 'Sexo', id: 'sexo' },
        { label: 'Nivel de estudios', id: 'nivelEstudios' },
        {
          label: '',
          id: 'documentopdf',
        }
        
      ],
    },
    {
      id: 'RESIDENCIALES',
      title: 'Datos Residenciales',
      description: 'Detalles sobre la residencia del solicitante.',
      fields: [
        { label: 'Dirección', id: 'direccion' },
        { label: 'Departamento de Residencia', id: 'departamentoResidencia' },
        { label: 'Ciudad de Residencia', id: 'ciudadResidencia' },
        { label: 'Tipo de Vivienda', id: 'tipoVivienda' },
        { label: 'Tiempo de Permanencia', id: 'tiempoPermanencia' },
        { label: 'Personas a Cargo', id: 'personasACargo' },
      ],
    },
    {
      id: 'LABORALES',
      title: 'Datos laborales',
      description: 'Recoge información laboral relevante del solicitante del crédito.',
      fields: [
        { label: 'Tipo de Trabajador', id: 'tipoTrabajador' },
        { label: 'Actividad Laboral', id: 'actividadLaboral' },
        { label: 'Tiempo en Actividad Comercial', id: 'tiempoActividadComercial' },
        { label: 'Ingresos Mensuales', id: 'ingresosMensuales' },
        { label: 'Gastos Mensuales', id: 'gastosMensuales' },
      ],
    },
    {
      id: 'FINANZAS',
      title: 'Destino de la transferencia',
      description: '¡Importante! Esta va a ser la cuenta donde será desembolsado tu crédito.',
      fields: [
        { label: 'Entidad Bancaria', id: 'entidadBancaria' },
        { label: 'Tipo de Cuenta', id: 'tipoCuenta' },
        { label: 'Número de Cuenta', id: 'numeroCuenta' },
      ],
    },
    {
      id: 'REFERENCIAS',
      title: 'Datos de referencia',
      description: 'Recopila datos de referencia del solicitante del crédito.',
      fields: [
        { label: 'Nombres de Referencia', id: 'nombresReferencia' },
        { label: 'Apellidos de Referencia', id: 'apellidosReferencia' },
        { label: 'Departamento de Referencia', id: 'departamentoReferencia' },
        { label: 'Ciudad de Referencia', id: 'ciudadReferencia' },
        { label: 'Teléfono de Referencia', id: 'telefonoReferencia' },
      ],
    },
  ];
   

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="xl:w-10/12 w-full px-8">
          <div className="xl:px-24">
  
            



            <div className="mt-4 mb-4" style={{ border: '1px solid white' }}>
              {isEditing ? (
                <div className="flex flex-col md:flex-row mt-4 items-center justify-center"> 
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-5 py-2 rounded mb-4 md:mb-0 md:mr-7"
                    disabled={isSaving}
                  >
                    Guardar
                  </button>
                  <button onClick={handleCancel} className="bg-red-500 text-white px-5 py-2 rounded" disabled={isSaving}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center mt-4">
                  <button onClick={handleUpdateInformation} className="bg-violet-800 text-white font-semibold hover:shadow-xl px-4 py-2 rounded update-information-button">
                    Actualizar datos
                  </button>
                </div>
              )}
            </div>


            <div className="px-5 py-4 bg-blue-50 rounded-lg flex items-center justify-between mt-2">
              <div className="flex flex-col items-center justify-center mx-auto">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon icon="typcn:info" color="#4b5563" width="24" height="24" />
                  </div>
                  <p className="text-sm text-gray-900 pl-3">
                    Debes llenar todos los campos para activar la opción de <strong>Solicitar Crédito.</strong>
                  </p>
                </div>
              </div>
            </div>

             {/* mapeo de pestañas - solo se muestra en pantallas grandes */}
             <div className="hidden md:flex items-center justify-center space-x-4">
              {tabs.map(({ id, title }) => (
                <div
                  key={id}
                  className={`cursor-pointer px-6 py-2 mt-6 text-sm ${activeTabs.has(id) ? 'text-indigo-900 font-semibold decoration-emerald-100' : 'text-blue-400'}`}
                  onClick={(e) => handleTabClick(id, e)}
                >
                  {title}
                </div>
              ))}
          </div>
            {/* fin mapeo de pestañas */}

           


            {tabs.map(({ id, title, description, fields }) => (
              <AccordionTab
                key={id}
                title={title}
                description={description}
                fields={fields}
                userData={userData}
                active={activeTabs.has(id)}
                onClick={handleTabClick}
                onUpdateField={onUpdateField}
                id={id}
                isEditing={isEditing}
                
              />
            ))}


            <div className="px-5 py-4 bg-gray-100 rounded-lg flex items-center justify-between mt-7 mb-12">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon icon="bxs:lock" color="#4b5563" width="24" height="24" />
                </div>

                <p className="text-sm text-gray-800 pl-3 text-center">
                  Nos tomamos en serio las cuestiones de privacidad. Puede estar seguro de que sus datos personales están protegidos.
                </p>
              </div>
            </div>


          </div>
        </div>
      </div>
    </>
  );
};

export default UserData;
