// src/components/Iconify.tsx

import { Icon, IconProps } from '@iconify/react';

interface IconifyComponentProps extends IconProps {
  icon: string;
}

const Iconify: React.FC<IconifyComponentProps> = ({ icon, ...props }) => {
  return <Icon icon={icon} {...props} />;
};

export default Iconify;
