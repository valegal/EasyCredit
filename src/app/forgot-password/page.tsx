'use client';
import Swal from 'sweetalert2';

import { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const resetEmail = async () => {
    

    try {
      await sendPasswordResetEmail(auth, email);
      
      Swal.fire({
        icon: 'success',
        title: 'Correo enviado',
        text: 'Te hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña.',
      }).then(() => {
        
        window.location.href = '/signin';
      });
    } catch (error) {
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al enviar el correo electrónico. Por favor, verifica la dirección de correo electrónico e inténtalo de nuevo.',
      });
    }
  };

  return (
    
    <div className="flex min-h-screen justify-center items-center bg-gradient-to-r from-violet-800 to-sky-500">
      <div className="w-full max-w-sm bg-white p-8 rounded-md shadow-md">
        <div className="text-center mb-8">
          <img
            className="mx-auto h-32 w-auto"
            src="/img/Logotipo Principal.png"
            alt="Your Company"
          />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Recupera tu contraseña</h2>
          <p className="text-gray-600">
            Proporciona la dirección de correo electrónico que utilizaste durante el registro, y te enviaremos las indicaciones para crear una contraseña nueva.
          </p>
        </div>
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-700">
              Correo electrónico
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-indigo-400 bg-gray-100"
              />
            </div>
          </div>

          <div>
            <button
              onClick={() => resetEmail()}
              disabled={!email}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
            >
              Enviar correo electrónico
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
}
