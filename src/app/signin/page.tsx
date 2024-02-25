'use client';

import 'tailwindcss/tailwind.css';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Iconify from '../components/Iconify';
import Swal from 'sweetalert2';

export default function Signin() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Function to handle the sign-in process
  const handleSignIn = async () => {
    const result = await signIn('credentials', { email, password, redirect: false });

    if (result && !result.error) {

      router.push('/');
    } else {
      // Display an error message using Swal (SweetAlert)
      Swal.fire({
        icon: 'error',
        title: 'Acceso no válido',
        text: 'Las credenciales proporcionadas son incorrectas. Por favor, verifica tu email o contraseña.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-950 to-green-500">
      <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          {/* Logo and Welcome Message */}
          <img
            className="mx-auto h-48 w-auto"
            src="img/Logo-Principal-para-fondos-claros.webp"
            alt="Credimonto logo"
          />
          <h2 className="mt-1 text-3xl font-bold text-indigo-950">¡Bienvenido a Credimonto!</h2>
        </div>

        <div className="mt-10">
          <div className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <label
                htmlFor="email"
                className={`absolute ${email ? '-top-0.5 text-xs left-3 font-semibold text-gray-800' : 'top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500'} transition-all duration-200 ease-in-out`}
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
                className="block w-full rounded-lg border border-gray-100 bg-gray-100 py-3 px-3 text-gray-800 focus:outline-none focus:border-indigo-400 transition-all duration-200 ease-in-out hover:border-green-500"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label
                htmlFor="password"
                className={`absolute ${password ? '-top-0.5 text-xs left-3 font-semibold text-gray-800' : 'top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500'} transition-all duration-300 ease-in-out`}
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-100 bg-gray-100 py-3 px-3 text-gray-800 focus:outline-none focus:border-indigo-400 transition-all duration-300 ease-in-out hover:border-green-500"
              />

              {/* Toggle Password Visibility */}
              <div className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Iconify icon="carbon:view" color="#6b7280" width="24" height="24" />
                ) : (
                  <Iconify icon="carbon:view-off" color="#6b7280" width="24" height="24" />
                )}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-sm text-right">
              <div onClick={() => router.push('/forgot-password')} className="cursor-pointer font-semibold text-green-500 hover:text-green-600">
                ¿Olvidaste tu contraseña?
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={!email || !password}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
            >
              Ingresar
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => router.push('signup')}
              className="font-semibold text-green-400 hover:text-green-500 underline"
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
