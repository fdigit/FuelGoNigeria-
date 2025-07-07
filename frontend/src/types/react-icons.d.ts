declare module 'react-icons/fi' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  export type IconType = ComponentType<IconProps>;
  
  export const FiX: IconType;
  export const FiUser: IconType;
  export const FiMail: IconType;
  export const FiPhone: IconType;
  export const FiShield: IconType;
  export const FiCalendar: IconType;
  export const FiMapPin: IconType;
  export const FiAlertTriangle: IconType;
  export const FiCheckCircle: IconType;
  export const FiXCircle: IconType;
  export const FiClock: IconType;
  export const FiEdit: IconType;
  export const FiTrash2: IconType;
  export const FiDownload: IconType;
  export const FiUpload: IconType;
  export const FiUsers: IconType;
  export const FiSearch: IconType;
  export const FiFilter: IconType;
  export const FiMoreVertical: IconType;
  export const FiEye: IconType;
  export const FiUserPlus: IconType;
  export const FiActivity: IconType;
  export const FiBarChart: IconType;
  export const FiSettings: IconType;
  export const FiTrendingUp: IconType;
  export const FiTrendingDown: IconType;
  export const FiUserCheck: IconType;
  export const FiUserX: IconType;
  export const FiRefreshCw: IconType;
  export const FiChevronDown: IconType;
  export const FiChevronUp: IconType;
  export const FiPlus: IconType;
  export const FiMinus: IconType;
} 