import { Role } from '@/types/shared.enum';
import { ISidebar } from '@/types/sidebar.interface';
import {
  Archive,
  Banknote,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  Compass,
  Cross,
  Home,
  MessageCircleMore,
  Settings,
  User,
  UserSearch,
  Hospital,
  ShieldCheck,
  Bell,
  CreditCard,
  EarthLock,
  BetweenHorizontalStart,
  Smile,
} from 'lucide-react';
import { getDynamicParamFromUrl } from '@/lib/utils';

export const DASHBOARD_ROUTE = '/dashboard';
export const SETTINGS_ROUTE = 'settings';

export const PATIENT_SIDE_BAR: ISidebar = {
  sidebarGroup: [
    {
      groupTitle: 'MAIN',
      menu: [
        {
          title: 'Home',
          url: DASHBOARD_ROUTE,
          Icon: Home,
        },
        {
          title: 'Find Doctors',
          url: `${DASHBOARD_ROUTE}/find-doctor`,
          Icon: Compass,
          phoneTitle: 'Doctors',
          relatedUrl: `${DASHBOARD_ROUTE}/book-appointment`,
        },
        {
          title: 'Appointments',
          url: `${DASHBOARD_ROUTE}/appointment`,
          Icon: CalendarDays,
        },
        {
          title: 'Records',
          url: `${DASHBOARD_ROUTE}/records`,
          Icon: Archive,
        },
        // TODO: Not planned for MVP
        // {
        //   title: 'Favorite Doctors',
        //   url: '#',
        //   Icon: Heart,
        //   phoneTitle: 'Favorite',
        // },
        // {
        //   title: 'Message',
        //   url: '#',
        //   Icon: MessageCircleMore,
        // },
      ],
    },

    {
      groupTitle: 'HELP & SETTINGS',
      menu: [
        {
          title: 'Help & Support',
          url: `${DASHBOARD_ROUTE}/help-support`,
          Icon: CircleHelp,
          phoneTitle: 'Help',
        },
        {
          title: 'Settings',
          url: `${DASHBOARD_ROUTE}/settings`,
          Icon: Settings,
        },
      ],
    },
  ],
} as const;

export const DOCTOR_SIDE_BAR: ISidebar = {
  sidebarGroup: [
    {
      groupTitle: 'MENU',
      menu: [
        {
          title: 'Home',
          url: DASHBOARD_ROUTE,
          Icon: Home,
        },
        {
          title: 'Appointments',
          url: `${DASHBOARD_ROUTE}/appointment`,
          Icon: CalendarDays,
        },
        {
          title: 'Patients',
          url: `${DASHBOARD_ROUTE}/patients`,
          Icon: User,
        },
        {
          title: 'Message',
          url: '#',
          Icon: MessageCircleMore,
        },
      ],
    },

    {
      groupTitle: 'HELP & SETTINGS',
      menu: [
        {
          title: 'Help & Support',
          url: `${DASHBOARD_ROUTE}/help-support`,
          Icon: CircleHelp,
          phoneTitle: 'Help',
        },
        {
          title: 'Settings',
          url: `${DASHBOARD_ROUTE}/settings`,
          Icon: Settings,
        },
      ],
    },
  ],
} as const;

export const ADMIN_SIDE_BAR: ISidebar = {
  sidebarGroup: [
    {
      groupTitle: 'MAIN',
      menu: [
        {
          title: 'Overview',
          url: DASHBOARD_ROUTE,
          Icon: Home,
        },
        {
          title: 'Analytics',
          url: '#',
          Icon: ChartNoAxesCombined,
        },
        {
          title: 'Appointments',
          url: `${DASHBOARD_ROUTE}/appointment`,
          Icon: CalendarDays,
        },
        {
          title: 'User',
          url: `${DASHBOARD_ROUTE}/doctor`,
          Icon: User,
          subMenu: [
            {
              title: 'Doctor',
              url: `${DASHBOARD_ROUTE}/doctor`,
            },
            {
              title: 'Patient',
              url: `${DASHBOARD_ROUTE}/patient`,
            },
            {
              title: 'Admin',
              url: `${DASHBOARD_ROUTE}/admin`,
            },
          ],
        },
        {
          title: 'Transactions',
          url: '#',
          Icon: Banknote,
        },
        {
          title: 'Organization Requests',
          url: `${DASHBOARD_ROUTE}/organization-requests`,
          Icon: Hospital,
          phoneTitle: 'Organization',
          only: Role.SuperAdmin,
        },
        {
          title: 'Manage S,M,I',
          url: '#',
          Icon: Cross,
        },
        {
          title: 'Customer Support',
          url: '#',
          Icon: UserSearch,
          phoneTitle: 'Support',
        },
      ],
    },

    {
      groupTitle: 'OTHER',
      menu: [
        {
          title: 'Settings',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}`,
          Icon: Settings,
        },
      ],
    },
  ],
} as const;

export const DOCTOR_SETTINGS_SIDEBAR: ISidebar = {
  sidebarGroup: [
    {
      groupTitle: 'ACCOUNT',
      menu: [
        {
          title: 'Personal',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}`,
          Icon: User,
        },
        {
          title: 'Security',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}/security`,
          Icon: ShieldCheck,
        },
        {
          title: 'Notification',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}/notification`,
          Icon: Bell,
        },
        {
          title: 'Payment',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}/payment`,
          Icon: Banknote,
        },
        {
          title: 'Identification',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}/identification`,
          Icon: CreditCard,
        },
        {
          title: 'Availability',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}/availability`,
          Icon: BetweenHorizontalStart,
        },
      ],
    },
  ],
};

export const ADMIN_SETTINGS_SIDEBAR: ISidebar = {
  sidebarGroup: [
    {
      groupTitle: '',
      menu: [
        {
          title: 'Hospital',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}`,
          Icon: User,
        },
        {
          title: 'Payment',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}/payment`,
          Icon: Banknote,
        },
        {
          title: 'Availability',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}/availability`,
          Icon: BetweenHorizontalStart,
        },
      ],
    },
  ],
};

export const PATIENT_RECORD_SIDEBAR: ISidebar = {
  sidebarGroup: [
    {
      groupTitle: "Patient's File",
      menu: [
        {
          title: 'Overview',
          url: `${DASHBOARD_ROUTE}/patients/${getDynamicParamFromUrl('patients')}`,
          Icon: Smile,
        },
      ],
    },
  ],
};

export const PATIENT_SETTINGS_SIDEBAR: ISidebar = {
  sidebarGroup: [
    {
      groupTitle: 'ACCOUNT',
      menu: [
        {
          title: 'Personal',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}`,
          Icon: User,
        },
        {
          title: 'Security',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}/security`,
          Icon: ShieldCheck,
        },
        {
          title: 'Notification',
          url: `${DASHBOARD_ROUTE}/${SETTINGS_ROUTE}/notification`,
          Icon: Bell,
        },
      ],
    },

    {
      groupTitle: 'OTHER',
      menu: [
        {
          title: 'Privacy',
          url: '#',
          Icon: EarthLock,
          phoneTitle: 'Help',
        },
      ],
    },
  ],
};
