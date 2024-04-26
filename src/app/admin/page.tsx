'use client';
// Importa las clases de Tailwind CSS según sea necesario.
// Importa las clases de Tailwind CSS según sea necesario.
import 'tailwindcss/tailwind.css';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import AdminLoanTable from './components/AdminLoanTable';
import AdminUsersTable from './components/AdminUsersTable';

const Admin = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('loans'); // 'loans' o 'users'

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace('/signin');
    },
  });

  const handleLogout = async () => {
    await signOut();
    router.replace('/signin');
  };

  if (status === 'loading') {
    return <div className="text-center mt-8">Loading...</div>;
  }

  // Verifica si el usuario es administrador
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (!isAdmin) {
    router.replace('/');
    return null;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-md shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
          <div className="flex lg:flex-1 items-center space-x-3 rtl:space-x-reverse">
          <a href="/" className="flex items-center">
            <img src="img/Perfiles2.webp" className="h-8" alt="EasyCredit Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white ml-2">
            <span style={{ color: 'rgb(0,150,255)' }}>Easy</span>
              <span style={{ color: 'rgb(88,0,255)' }}>Credit</span>
            </span>
            <h1  className='text-credimonto-blue font-bold text-3xl ml-4'> Administrador</h1>
            
          </a>
        </div>
            <p className='text-gray-500 mt-4'>Bienvenido, {session?.user?.email}.</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:overline transition duration-300"
          >
           ⛔ Cerrar sesión
          </button>
        </div>

        {/* Botones de pestañas */}
        <div className="flex space-x-4 my-4">
          <button
            onClick={() => setActiveTab('loans')}
            className={`py-2 px-4 rounded-md ${
              activeTab === 'loans' ? 'bg-indigo-700 text-white' : 'bg-violet-200 text-indigo-900'
            }`}
          >
            Solicitudes de Crédito
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-4 rounded-md ${
              activeTab === 'users' ? 'bg-indigo-700 text-white' : 'bg-violet-200 text-inidigo-900'
            }`}
          >
            Usuarios
          </button>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'loans' && <AdminLoanTable />}
        {activeTab === 'users' && <AdminUsersTable />}
      </div>
    </div>
  );
};

export default Admin;
