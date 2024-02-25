import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getFirestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Loading from '@/app/components/Loading';
import { Icon } from '@iconify/react';
import AccordionTab from './AccordionTab-admin';

interface UserData {
  [key: string]: string;
}

interface Tab {
  id: string;
  title: string;
  description: string;
  fields: Array<string>;
}

const UserData: React.FC = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState<Set<string>>(new Set<string>());
  const [defaultActiveTab, setDefaultActiveTab] = useState<string>('BÁSICOS');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const [areTabsOpen, setAreTabsOpen] = useState(false);

  const handleTabClick = (tabId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const isClickInsideInput = (e.target as HTMLElement).tagName === 'INPUT';

    if (!isClickInsideInput) {
      if (isEditing && isSaving) {
        // Evita cambios mientras se está guardando
        return;
      }

      const updatedActiveTabs = new Set(activeTabs);

      if (updatedActiveTabs.has(tabId)) {
        // Si la pestaña está abierta, se cierra
        updatedActiveTabs.delete(tabId);
      } else {
        // Si la pestaña está cerrada, se abre
        updatedActiveTabs.add(tabId);
      }

      // Actualiza el estado con el nuevo conjunto de pestañas activas
      setActiveTabs(updatedActiveTabs);
    }
  };

  const onUpdateField = async (tabId: string, field: string, value: string) => {
    if (!session?.user?.email) {
      console.error('No user email found in session.');
      return;
    }
  
    // Check if the field is restricted from editing
    const isRestrictedField = ['Nivel de estudios', 'Ciudad'].includes(field);
  
    if (isRestrictedField && isEditing) {
      // If it's a restricted field and we are in edit mode, prevent updating
      console.log(`Editing ${field} is restricted.`);
      return;
    }
  
    setUserData((prevUserData) => ({
      ...prevUserData,
      [field]: value,
    }));
  
    try {
      // Only update Firestore if the field is not restricted
      if (!isRestrictedField) {
        const userDocRef = doc(collection(db, 'usuarios'), session.user.email);
        await setDoc(userDocRef, { [field]: value }, { merge: true });
      }
    } catch (error) {
      console.error(`Error updating/creating field "${field}" in Firebase:`, error);
    }
  };
  
  

  const handleUpdateInformation = () => {
    setIsEditing(true);
    console.log('Modo de edición activado.');
  };
  
  const handleSave = async () => {
    try {
      // Lógica para guardar la información
  
      if (!session?.user?.email) {
        console.error('No user email found in session.');
        return;
      }
  
      const userDocRef = doc(collection(db, 'usuarios'), session.user.email);
      await setDoc(userDocRef, userData, { merge: true });
  
      console.log('Información guardada exitosamente.');
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
    { id: 'BÁSICOS', title: 'Datos Básicos', description: 'Esta sección recopila información básica del solicitante del crédito.', fields: ['Nombres', 'Apellidos', 'Número de documento', 'Teléfono', 'Fecha de expedición', 'Ciudad y departamento de expedición', 'Fecha de nacimiento', 'Ciudad y departamento de nacimiento', 'Estado civil', 'Sexo', 'Nivel de estudios','Email'] },
    { id: 'RESIDENCIALES', title: 'Datos Residenciales', description: 'Obtén detalles sobre la residencia del solicitante.', fields: ['Dirección', 'Ciudad', 'Tipo de Vivienda', 'Tiempo de Permanencia', 'Personas a Cargo'] },
    { id: 'LABORALES', title: 'Datos Laborales', description: 'Recoge información laboral relevante del solicitante del crédito.', fields: ['Tipo de Trabajador', 'Actividad Laboral', 'Tiempo en Actividad Comercial', 'Ingresos Mensuales', 'Gastos Mensuales'] },
    { id: 'FINANZAS ACTUALES', title: 'Finanzas Actuales', description: 'Analiza la situación financiera actual del solicitante.', fields: ['Entidad Bancaria', 'Tipo de Cuenta', 'Número de Cuenta'] },
    { id: 'REFERENCIAS', title: 'Referencias', description: 'Recopila datos de referencia del solicitante del crédito.', fields: ['Nombres de Referencia', 'Apellidos de Referencia', 'Ciudad de Referencia', 'Teléfono de Referencia'] },
];

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="xl:w-10/12 w-full px-8">
          <div className="xl:px-24">
          <div className="flex items-center justify-center space-x-4 hidden md:flex">
            {tabs.map(({ id, title }) => (
              <div
                key={id}
                className={`cursor-pointer px-4 py-2 mt-8 text-sm ${activeTabs.has(id) ? 'text-indigo-900 font-semibold decoration-emerald-100' : 'text-green-400'}`}
                onClick={(e) => handleTabClick(id, e)}
              >
                {title}
              </div>
            ))}
          </div>

            <div className="px-5 py-4 bg-gray-100 rounded-lg flex items-center justify-between mt-7">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon icon="bxs:lock" color="#4b5563" width="24" height="24" />
                </div>

                <p className="text-sm text-gray-800 pl-3 text-center">
                  Nos tomamos en serio las cuestiones de privacidad. Puede estar seguro de que sus datos personales están protegidos de forma segura.
                </p>
              </div>
            </div>

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

            <div className="px-5 py-4 bg-green-100 rounded-lg flex items-center justify-between mt-7">
              <div className="flex flex-col items-center justify-center mx-auto">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon icon="typcn:info" color="#4b5563" width="24" height="24" />
                  </div>
                  <p className="text-sm text-gray-800 pl-3">
                    Debes llenar todos los campos para activar la opción de <strong>Solicitar Crédito.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 mb-10" style={{ border: '1px solid white' }}>
              {isEditing ? (
                <div className="flex items-center justify-end mt-4">
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                    disabled={isSaving}
                  >
                    Guardar
                  </button>
                  <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded" disabled={isSaving}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-end mt-4">
                  <button onClick={handleUpdateInformation} className="bg-blue-500 text-white px-4 py-2 rounded update-information-button">
                    Actualizar Información
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default UserData;
