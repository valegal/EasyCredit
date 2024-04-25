import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import UserData from './Userdata';
import InputFileUpload from '../InputFileUpload';

import colombiaData from '../../../../public/data/colombia.json';

interface AccordionTabProps {
  id: string;
  title: string;
  description: string;
  fields: Array<{ label: string; id: string }>;
  userData: UserData | null;
  active: boolean;
  onClick: (tabId: string, e: React.MouseEvent<HTMLDivElement>) => void;
  onUpdateField: (tabId: string, field: string, value: string) => void;
  isEditing: boolean;
}

const DatePickerField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}> = ({ value, onChange, disabled }) => (
  <input
    type="date"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className="w-full mt-2 bg-white rounded focus:outline-none focus:border-gray-700 text-sm font-medium leading-none text-gray-700 border-1.5px-dashed border-cab4fa"
    style={{ border: '1.5px dashed #cab4fa', padding: '8px', height: '42px' }}
  />
);

const SelectField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  options: string[];
}> = ({ value, onChange, disabled, options }) => {
  return (
    <select
      value={options.includes(value) ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full mt-2 bg-white rounded focus:outline-none focus:border-gray-700 text-sm font-medium leading-none text-gray-700 border-1.5px-dashed border-cab4fa"
      style={{ border: '1.5px dashed #cab4fa', padding: '8px', height: '42px' }}
    >
      <option value=""> </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};


// OPCIONES

const getOptionsForField = (fieldId: string, selectedDepartments: { [key: string]: string }): string[] => {
  switch (fieldId) {
    case 'estadoCivil':
      return ['Soltero', 'Casado', 'Divorciado', 'Viudo'];
    case 'nivelEstudios':
      return ['Educación Básica',
        'Bachiller',
        'Técnico',
        'Técnologo',
        'Pregrado',
        'Posgrado'];
    case 'tipoVivienda':
      return ['Propia', 'Familiar', 'Arrendada'];
    case 'tiempoPermanencia':
      return ['De 0 a 6 meses',
      'De 6 a 12 meses',
       'De 1 a 3 años',
      'Más de 3 años'];
    case 'tiempoActividadComercial':
      return ['De 0 a 6 meses',
      'De 6 a 12 meses',
       'De 1 a 3 años',
      'Más de 3 años'];
    case 'sexo':
        return ['Masculino','Femenino'];
    case 'tipoCuenta':
          return ['Corriente','Ahorros'];
    case 'entidadBancaria':
          return [
            'Banco Agrario de Colombia',
            'Banco AV Villas',
            'Banco Caja Social',
            'Banco Cooperativo Coopcentral',
            'Banco ITAÚ',
            'Banco de Bogotá',
            'Banco de Occidente',
            'Banco Falabella',
            'Banco GNB Sudameris',
            'Banco Pichincha',
            'Banco Popular',
            'Bancolombia',
            'Bancoomeva',
            'Banco BBVA',
            'Nequi',
            'Daviplata',
            'Citibank',
            'Banco W',
            'Banco Colpatria',
            'Banco Davivienda',
            'Banco Mundo Mujer',

          ];
    case 'tipoTrabajador':
      return ['Desempleado',
      'Estudiante',
      'Empleado formal',
      'Empleado informal',
      'Independiente',
      'Comerciante'];
    case 'personasACargo':
      return ['0', '1', '2', '3', 'Más de 3'];
      case 'ciudadExpedicion':
        case 'ciudadNacimiento':
        case 'ciudadResidencia':
        case 'ciudadReferencia':
          const selectedDepartment = selectedDepartments[`departamento${fieldId.substring(6)}`];
          const departmentData = colombiaData.find((dep) => dep.departamento === selectedDepartment);
          return departmentData?.ciudades || [];
    
        case 'departamentoExpedicion':
        case 'departamentoNacimiento':
        case 'departamentoResidencia':
        case 'departamentoReferencia':
          return colombiaData.map((dep) => dep.departamento);
    
        default:
          return [];
  }
};

const AccordionTab: React.FC<AccordionTabProps> = ({
  id,
  title,
  description,
  fields,
  userData,
  active,
  onClick,
  onUpdateField,
  isEditing,
  
}) => {

  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Inicializar selectedDepartments con los valores iniciales aquí
    const initialSelectedDepartments: { [key: string]: string } = {};
    fields.forEach((field) => {
      if (field.id.startsWith('departamento')) {
        initialSelectedDepartments[field.id] = userData?.[field.id] || '';
      }
    });
    setSelectedDepartments(initialSelectedDepartments);
  }, [fields, userData]);

  const handlePdfLoad = (content: string) => {
    setPdfContent(content);
  };

  const handleDepartmentChange = (fieldId: string, value: string) => {
    setSelectedDepartments((prevDepartments) => ({
      ...prevDepartments,
      [fieldId]: value,
    }));
    onUpdateField(id, fieldId, value);
  };

  return (
    <div className="mt-6">
      <div className={`border-lg ${active ? 'border-primary' : 'border-gray-200'} bg-gray-100 rounded p-4`}>
        <div
          tabIndex={0}
          className={`flex flex-col cursor-pointer focus:outline-none ${active ? 'border-primary' : ''}`}
          onClick={(e) => onClick(id, e)}
        >
          <div className="flex items-center justify-between">
            <div className="text-xl font-medium text-indigo-900">{title}</div>
            <div className={`collapse-arrow ${active ? 'transform rotate-180 text-primary' : 'text-gray-500'}`}>
              <Icon icon="bxs:down-arrow" color="#cab4fa" />
            </div>
          </div>
          <p className={`mt-2 text-sm ${active ? 'text-gray-600' : 'text-gray-900'}`}>{description}</p>
          {active && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8" onClick={(e) => e.stopPropagation()}>
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="text-sm leading-none text-indigo-950" id={field.id}>
                    {field.label === 'email' ? `Correo Electrónico` : field.label.charAt(0).toUpperCase() + field.label.slice(1)}
                  </label>
                  {field.id === 'documentopdf' ? (
                    <div className="flex items-center justify-center mt-6">
                      <InputFileUpload onPdfLoad={handlePdfLoad} />
                    </div>
                  ) : field.id === 'fechaNacimiento' || field.id === 'fechaExpedicion' ? (
                    <div>
                    
                      <DatePickerField
                        value={userData?.[field.id] || ''}
                        onChange={(value) => onUpdateField(id, field.id, value)}
                        disabled={!isEditing}
                      />

                    </div>
                  ) : (
                    <div>
                      {['estadoCivil', 'tipoTrabajador', 'tipoCuenta', 'entidadBancaria', 'sexo', 'tiempoActividadComercial', 'nivelEstudios', 'tipoVivienda', 'tiempoPermanencia', 'personasACargo', 'departamentoExpedicion', 'ciudadExpedicion', 'departamentoNacimiento', 'ciudadNacimiento', 'ciudadResidencia','ciudadReferencia','departamentoResidencia','departamentoReferencia'].includes(field.id) ? (
                          <SelectField
                      value={userData?.[field.id] || ''}
                      onChange={(value) => {
                        onUpdateField(id, field.id, value);
                        if (field.id.startsWith('departamento')) {
                          handleDepartmentChange(field.id, value);
                        }
                      }}
                      disabled={!isEditing}
                      options={getOptionsForField(field.id, selectedDepartments)}
                    />
                      ) : (
                        <input
                          type="text"
                          tabIndex={0}
                          style={{ border: '1.5px dashed #cab4fa', padding: '8px', height: '42px' }}
                          className="w-full mt-2 bg-white rounded focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-700 border-1.5px-dashed border-[#661fff]"
                          aria-labelledby={field.id}
                          placeholder={userData?.[field.id] ? '' : undefined}
                          value={userData?.[field.id] || ''}
                          onChange={(e) => onUpdateField(id, field.id, e.target.value)}
                          disabled={!isEditing}
                          readOnly={field.id === 'Nombres' || field.id === 'Apellidos' ||
                           field.id === 'documentoId' || field.id === 'telefono' || field.id === 'email'}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

};




export default AccordionTab;