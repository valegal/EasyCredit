// En AccordionTab.tsx
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Popover from '../components/Popover';
import UserData from './Userdata-admin';

interface AccordionTabProps {
  id: string;
  title: string;
  description: string;
  fields: Array<string>;
  userData: UserData | null;
  active: boolean;
  onClick: (tabId: string, e: React.MouseEvent<HTMLDivElement>) => void;
  onUpdateField: (tabId: string, field: string, value: string) => void;
  isEditing: boolean;
}

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
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);

  const fieldsWithHoverMessage = ['Email', 'Nivel de estudios'];

  const handleInputMouseEnter = (field: string) => {
    if (fieldsWithHoverMessage.includes(field)) {
      setHoveredInput(field);
    }
  };

  const handleInputMouseLeave = () => {
    setHoveredInput(null);
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
              <Icon icon="bxs:down-arrow" color="#a4e786" />
            </div>
          </div>
          <p className={`mt-2 text-sm ${active ? 'text-gray-600' : 'text-gray-900'}`}>{description}</p>
          {active && (
            <div
              className="mt-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              {fields.map((field) => (
  <div key={field}>
    <label className="text-sm leading-none text-indigo-950" id={field}>
      {field === 'email' ? 'Correo Electrónico' : field.charAt(0).toUpperCase() + field.slice(1)}
    </label>
    <input
      type="text"
      tabIndex={0}
      style={{ border: '1.5px dashed #a4e786', padding: '8px', height: '42px' }}
      className="w-full mt-2 bg-white rounded focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-700"
      aria-labelledby={field}
      placeholder={`Ingresa ${field === 'email' ? 'email' : field}`}
      value={userData?.[field] || ''}
      onChange={(e) => onUpdateField(id, field, e.target.value)}
      disabled={!isEditing || ['Nivel de estudios', 'Ciudad'].includes(field)}
      onMouseEnter={() => handleInputMouseEnter(field)}
      onMouseLeave={handleInputMouseLeave}
    />
    {hoveredInput === field && (
      <Popover>
        {/* Contenido del cuadro flotante */}
        El usuario no puede editar el campo {field}
      </Popover>
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
