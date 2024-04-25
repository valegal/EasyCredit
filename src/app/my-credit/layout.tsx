"use client"

import type { Metadata } from 'next';
import { useState } from 'react';
import Swal from 'sweetalert2';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  const handleInfoButtonClick = () => {
    Swal.fire({
      icon: 'info',
      title: 'Información de Pagos',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Titular:</strong> EASYCREDIT SAS</p>
          <p class="mb-2"><strong>NIT:</strong> 901753299</p>
          <p class="mb-2"><strong>Banco:</strong> LULO BANK</p>
          <p class="mb-2"><strong>Tipo de cuenta:</strong> Ahorros</p>
          <p class="mb-2"><strong>Número de cuenta:</strong> 1402 6986 6696</p>
          <p class="mb-2 mt-4"><strong>Importante:</strong> Para que el pago del crédito sea efectivo, se debe enviar el comprobante de pago con el número de solicitud, nombres, apellidos, número de cédula del solicitante y captura del crédito actual al siguiente número:</p>
          <p><strong>Número de contacto:</strong> +57 300 2506261</p>
        </div>
      `,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      
    });
  };

  return (
    <div>
      
      <button
        className="fixed bottom-5 right-5 z-10 bg-indigo-700 text-white py-2 px-4 rounded-full hover:bg-indigo-600 hover:text-blue"
        onClick={handleInfoButtonClick}
      >
        Pagar crédito
      </button>
      

      
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default Layout;
