'use client';

import 'tailwindcss/tailwind.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth, db } from '../firebase';
import Swal from 'sweetalert2';
import Iconify from '../components/Iconify';
import { signIn } from 'next-auth/react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [Nombres, setFirstName] = useState('');
  const [Apellidos, setLastName] = useState('');
  const [documentoId, setDocumentId] = useState('');
  const [telefono, setTelefono] = useState('');
  const [passwordRequirementsVisible, setPasswordRequirementsVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const router = useRouter();

  const signup = async () => {
    try {
      // Validación de campos vacíos
      if (!email || !password || !passwordAgain || !Nombres || !Apellidos || !documentoId || !telefono || !termsAccepted || !privacyPolicyAccepted) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Por favor, completa todos los campos antes de continuar.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
        return;
      }

      // Resto del código de registro
      if (password !== passwordAgain || !termsAccepted || !privacyPolicyAccepted) {
        setPasswordMatchError(true);
        return;
      }

      // Consultar todos los documentos en la colección de usuarios
    const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));

    // Verificar si ya existe un usuario con el mismo email, documentoId o telefono
    usuariosSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.email === email) {
        throw new Error('El correo electrónico ya está en uso.');
      }
      if (data.documentoId === documentoId) {
        throw new Error('Ya existe un usuario con este documento de identidad.');
      }
      if (data.telefono === telefono) {
        throw new Error('Ya existe un usuario con este número de teléfono.');
      }
    });
    

      await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'usuarios', email), {
        Nombres,
        Apellidos,
        documentoId,
        telefono,
        email,
        calificacionCrediticia: 'Sin información', 
      });

      setPasswordMatchError(false);

      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Tu cuenta ha sido creada con éxito.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
      
      await signIn('credentials', { email, password, redirect: false });
      router.push('/'); // Redirige a la página de inicio
    } catch (error: any) { 
      console.error(error);
  
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: error.message || 'Hubo un problema al intentar crear tu cuenta.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordRequirementsVisible(newPassword.length > 0 && newPassword.length < 6);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-950 to-green-500">
      <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md">
        <div className="text-center mb-8">
          <img
            className="mx-auto h-12 w-auto"
            src="/img/Logotipo-Invertido.webp"
            alt="Your Company"
          />
          <h3 className="mt-5 text-3xl font-bold text-indigo-950">Regístrate</h3>
        </div>
        
        <div className="flex items-center mb-8 space-x-4">
          <div className="border-t border-gray-300 flex-grow"></div>
          <p className="my-4 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => router.push('/')}
              className="font-semibold text-green-400 hover:text-green-500"
            >
              Acceder
            </button>
          </p>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); signup(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sección de Nombres */}
            <div className='relative'>
              <label htmlFor="Nombres" className={`absolute ${Nombres ? '-top-0.5 text-xs left-3 font-semibold text-gray-400' : 'top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500'} transition-all duration-200 ease-in-out`}>
                Nombres
              </label>
              <input
                id="Nombres"
                name="Nombres"
                type="text"
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-2 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-indigo-400 bg-gray-100"
              />
            </div>

            {/* Sección de Apellidos */}
            <div className='relative'>
              <label htmlFor="Apellidos" 
             className={`absolute ${Apellidos ? '-top-0.5 text-xs left-3 font-semibold text-gray-400' : 'top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500'} transition-all duration-200 ease-in-out`}>
                Apellidos
              </label>
              <input
                id="Apellidos"
                name="Apellidos"
                type="text"
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-2 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-indigo-400 bg-gray-100"
              />
            </div>
          </div>
  
          {/* Otras secciones del formulario (documentoId, telefono, email, etc.) */}
          
          <div className="relative">
            <label htmlFor="documentoId" 
            className={`absolute ${documentoId ? '-top-0.5 text-xs left-3 font-semibold text-gray-400' : 'top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500'} transition-all duration-200 ease-in-out`}
            >
              Documento de identidad
            </label>
            <input
              id="documentoId"
              name="documentoId"
              type="text"
              onChange={(e) => setDocumentId(e.target.value)}
              required
              className="w-full px-2 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-indigo-400 bg-gray-100"
            />
          </div>
  
          <div className="relative">
            <label htmlFor="telefono" 
            className={`absolute ${telefono ? '-top-0.5 text-xs left-3 font-semibold text-gray-400' : 'top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500'} transition-all duration-200 ease-in-out`}
            >
              Número de teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="text"
              onChange={(e) => setTelefono(e.target.value)}
              required
              className="w-full px-2 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-indigo-400 bg-gray-100"
            />
          </div>
  
          <div className="relative">
            <label
              htmlFor="email"
              className={`absolute ${email ? '-top-0.5 text-xs left-3 font-semibold text-gray-400' : 'top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500'} transition-all duration-200 ease-in-out`}
            >
              Dirección email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-2 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-indigo-400 bg-gray-100"
            />
          </div>
  
          <div className="relative">
            <label
              htmlFor="password"
              className={`absolute ${password ? '-top-0.5 text-xs left-3 font-semibold text-gray-400' : 'top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500'} transition-all duration-300 ease-in-out`}
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              onChange={handlePasswordChange}
              required
              className="w-full px-2 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-indigo-400 bg-gray-100"
            />
            {passwordRequirementsVisible && (
              <div className="text-sm text-red-500">
                La contraseña debe tener al menos 6 caracteres.
              </div>
            )}
            
            {/* Toggle Password Visibility for password */}
            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <Iconify icon="carbon:view" color="#6b7280" width="24" height="24" />
              ) : (
                <Iconify icon="carbon:view-off" color="#6b7280" width="24" height="24" />
              )}
            </div>
          </div>
  
          <div className="relative mb-5">
            <label
              htmlFor="passwordAgain"
              className={`absolute ${passwordAgain ? '-top-0.5 text-xs left-3 font-semibold text-gray-400' : 'top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500'} transition-all duration-300 ease-in-out`}
            >
              Ingresa nuevamente la contraseña
            </label>
            <input
              id="passwordAgain"
              name="passwordAgain"
              type={showPasswordAgain ? 'text' : 'password'}
              autoComplete="current-password"
              onChange={(e) => setPasswordAgain(e.target.value)}
              required
              className="w-full px-2 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-indigo-400 bg-gray-100"
            />

            {/* Toggle Password Visibility for passwordAgain */}
            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowPasswordAgain(!showPasswordAgain)}>
              {showPasswordAgain ? (
                <Iconify icon="carbon:view" color="#6b7280" width="24" height="24" />
              ) : (
                <Iconify icon="carbon:view-off" color="#6b7280" width="24" height="24" />
              )}
            </div>
          </div>
      

          <div className="flex items-center ml-4 space-x-3 text-xs">
            <input
              type="checkbox"
              id="termsCheckbox"
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label htmlFor="termsCheckbox">
            Acepto los <a href="https://drive.google.com/file/d/1zNZcH6QP6DdDO8w4ddymEYUGf2S3Ret0/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">términos y condiciones.</a>
            </label>
          </div>

          <div className="flex items-center ml-4 space-x-3 text-xs">
            <input
              type="checkbox"
              id="privacyPolicyCheckbox"
              onChange={() => setPrivacyPolicyAccepted(!privacyPolicyAccepted)}
            />
            <label htmlFor="privacyPolicyCheckbox">
              Declaro que he leído y acepto la <a href="https://drive.google.com/file/d/1zNZcH6QP6DdDO8w4ddymEYUGf2S3Ret0/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">política de protección de datos Personales</a>, así
              mismo <a href="https://drive.google.com/file/d/1zNZcH6QP6DdDO8w4ddymEYUGf2S3Ret0/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">autorizo expresamente</a> a Credimonto para que recolecte, almacene, use,
              transfiera y/o elimine mis datos personales.
            </label>
          </div>

          <div>
            {passwordMatchError && (
              <div className="text-sm text-red-500">
                Las contraseñas no coinciden o no has aceptado los términos y condiciones.
              </div>
            )}

            <button
              disabled={!email || !password || !passwordAgain || passwordRequirementsVisible || !termsAccepted || !privacyPolicyAccepted}
              className="w-full mt-5 px-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
            >
              Registrarme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
