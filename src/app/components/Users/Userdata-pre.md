import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Loading from'@/app/components/Loading';

interface UserData {
  nombre: string;
  apellido: string;
  telefono: string;
  
}

const UserData: React.FC = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
    const UserData: React.FC = () => {
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        finally {
          setLoading(false);
        }
      }
    const UserData: React.FC = () => {
    fetchUserData();
  }, [status, session]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="xl:w-10/12 w-full px-8">

          <div className="xl:px-24">
            <div className="px-5 py-4 bg-gray-100 rounded-lg flex items-center justify-between mt-7">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 9.99999H20C20.2652 9.99999 20.5196 10.1054 20.7071 10.2929C20.8946 10.4804 21 10.7348 21 11V21C21 21.2652 20.8946 21.5196 20.7071 21.7071C20.5196 21.8946 20.2652 22 20 22H4C3.73478 22 3.48043 21.8946 3.29289 21.7071C3.10536 21.5196 3 21.2652 3 21V11C3 10.7348 3.10536 10.4804 3.29289 10.2929C3.48043 10.1054 3.73478 9.99999 4 9.99999H5V8.99999C5 8.08074 5.18106 7.17049 5.53284 6.32121C5.88463 5.47193 6.40024 4.70026 7.05025 4.05025C7.70026 3.40023 8.47194 2.88462 9.32122 2.53284C10.1705 2.18105 11.0807 1.99999 12 1.99999C12.9193 1.99999 13.8295 2.18105 14.6788 2.53284C15.5281 2.88462 16.2997 3.40023 16.9497 4.05025C17.5998 4.70026 18.1154 5.47193 18.4672 6.32121C18.8189 7.17049 19 8.08074 19 8.99999V9.99999ZM17 9.99999V8.99999C17 7.67391 16.4732 6.40214 15.5355 5.46446C14.5979 4.52678 13.3261 3.99999 12 3.99999C10.6739 3.99999 9.40215 4.52678 8.46447 5.46446C7.52678 6.40214 7 7.67391 7 8.99999V9.99999H17ZM11 14V18H13V14H11Z"
                      fill="#4B5563"
                    />
                  </svg>
                </div>

                <p className="text-sm text-gray-800 pl-3">Nos tomamos en serio las cuestiones de privacidad. Puede estar seguro de que sus datos personales están protegidos de forma segura.</p>
              </div>

            </div>
            <div className="mt-16 lg:flex justify-between border-b border-gray-200 pb-16">
              <div className="w-80">
                <div className="flex items-center">
                  <h1 className="text-xl font-medium pr-2 leading-5 text-gray-800">Datos Básicos</h1>
                </div>
                <p className="mt-4 text-sm leading-5 text-gray-600">
                  Esta sección recopila información básica del solicitante del crédito.</p>
              </div>
              <div>
                <div className="md:flex items-center lg:ml-24 lg:mt-0 mt-4">
                  <div className="md:w-64">
                    <label className="text-sm leading-none text-gray-800" id="firstName" >Nombre</label>
                    <input type="text" tabIndex={0} className="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800" aria-labelledby="firstName" value={userData?.nombre || ''}
                      readOnly />
                  </div>
                  <div className="md:w-64 md:ml-12 md:mt-0 mt-4">
                    <label className="text-sm leading-none text-gray-800" id="lastName">Apellido</label>
                    <input type="text" tabIndex={0} className="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800" aria-labelledby="lastName" value={userData?.apellido || ''} readOnly />
                  </div>
                </div>
                <div className="md:flex items-center lg:ml-24 mt-8">
                  {session?.user ? (
                    <div className="md:w-64">
                      <label className="text-sm leading-none text-gray-800" id="emailAddress">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        tabIndex={0}
                        className="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800"
                        aria-labelledby="emailAddress"
                        value={session.user.email ?? ''}
                        readOnly
                      />
                    </div>
                  ) : null}

                  <div className="md:w-64 md:ml-12 md:mt-0 mt-4">
                    <label className="text-sm leading-none text-gray-800" id="phone" >Teléfono</label>
                    <input type="text" tabIndex={0} className="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800" aria-labelledby="phone" placeholder="123-1234567" value={userData?.telefono || ''} readOnly />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 lg:flex justify-between border-b border-gray-200 pb-16 mb-4">
              <div className="w-80">
                <div className="flex items-center">
                  <h1 className="text-xl font-medium pr-2 leading-5 text-gray-800">Security</h1>
                </div>
                <p className="mt-4 text-sm leading-5 text-gray-600">Information about the section could go here and a brief description of how this might be used.</p>
              </div>
              <div>
                <div className="md:flex items-center lg:ml-24 lg:mt-0 mt-4">
                  <div className="md:w-64">
                    <label className="text-sm leading-none text-gray-800" id="password">Password</label>
                    <input type="text" tabIndex={0} className="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800" aria-labelledby="password" placeholder="Enter your password" />
                  </div>
                  <div className="md:w-64 md:ml-12 md:mt-0 mt-4">
                    <label className="text-sm leading-none text-gray-800" id="securityCode">Security Code</label>
                    <input type="text" tabIndex={0} className="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800" aria-labelledby="securityCode" placeholder="Enter your security code" />
                  </div>
                </div>
                <div className="md:flex items-center lg:ml-24 mt-8">
                  <div className="md:w-64">
                    <label className="text-sm leading-none text-gray-800" id="recoverEmail">Recovery Email address</label>
                    <input type="text" tabIndex={0} className="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800" aria-labelledby="recoveryEmail" placeholder="Your recovery email" />
                  </div>
                  <div className="md:w-64 md:ml-12 md:mt-0 mt-4">
                    <label className="text-sm leading-none text-gray-800" id="altPhone">Alternate phone number</label>
                    <input type="text" tabIndex={0} className="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800" aria-labelledby="altPhone" placeholder="Your alternate phone number" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



-----


const tabs: Tab[] = [
    { id: 'BÁSICOS', title: 'Datos Básicos', description: 'Esta sección recopila información básica del solicitante del crédito.', fields: ['nombres', 'apellidos', 'nroDocumento', 'telefono', 'fechaExped', 'ciudadDepartaExped', 'fechaNacim', 'ciudadDepartaNacim', 'estadoCivil', 'sexo', 'nivelEstudios'] },
    { id: 'RESIDENCIALES', title: 'Datos Residenciales', description: 'Esta sección recopila información residencial del solicitante del crédito.', fields: ['direccionResidencia', 'ciudadResidencia', 'tipoVivienda', 'tiempoPermanencia', 'personasACargo'] },
    { id: 'LABORALES', title: 'Datos Laborales', description: 'Esta sección recopila información laboral del solicitante del crédito.', fields: ['tipoTrabajador', 'activiLaboral', 'tiempoActividadComercial?', 'ingresosPromedioMensuales', 'gastosPromedioMensuales'] },
    { id: 'FINANZAS ACTUALES', title: 'Finanzas Actuales', description: 'Esta sección recopila información sobre las finanzas actuales del solicitante del crédito.', fields: ['entidadBancaria', 'tipoDeCuenta', 'numeroCuenta'] },
    { id: 'REFERENCIAS', title: 'Referencias', description: 'Esta sección recopila información de referencia del solicitante del crédito.', fields: ['apellidosRef', 'nombresRef', 'ciudadReferencia', 'telReferencia'] },
  ];