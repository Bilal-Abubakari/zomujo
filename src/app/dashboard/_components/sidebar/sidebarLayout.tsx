'use client';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronDown, EllipsisVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ProfileCompletionCard from '../profileCompletionCard/ProfileCompletionCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/assets/images';
import { cn } from '@/lib/utils';
import { AvatarComp } from '@/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectIsAnAdmin, selectUserName, selectUserRole } from '@/lib/features/auth/authSelector';
import { Role, SidebarType } from '@/types/shared.enum';
import { JSX } from 'react';
import { ISidebar } from '@/types/sidebar.interface';
import {
  ADMIN_SETTINGS_SIDEBAR,
  ADMIN_SIDE_BAR,
  DOCTOR_SETTINGS_SIDEBAR,
  DOCTOR_SIDE_BAR,
  PATIENT_SETTINGS_SIDEBAR,
  PATIENT_SIDE_BAR,
} from '@/constants/sidebar.constant';
import { logout } from '@/lib/features/auth/authThunk';

type SideBarProps = {
  type?: SidebarType;
  sidebarClassName?: string;
  sidebarContentClassName?: string;
  sidebarTabClassName?: string;
};
export const SidebarLayout = ({
  type,
  sidebarClassName,
  sidebarContentClassName,
  sidebarTabClassName,
}: SideBarProps): JSX.Element => {
  const userName = useAppSelector(selectUserName);
  const isAnAdmin = useAppSelector(selectIsAnAdmin);
  const role = useAppSelector(selectUserRole);
  const pathName = usePathname();

  const getRole = (): string => {
    switch (role) {
      case Role.SuperAdmin:
        return 'Super Admin';
      case Role.Admin:
        return 'Admin';
      case Role.Doctor:
        return 'Doctor';
      case Role.Patient:
        return 'Patient';
      default:
        return '';
    }
  };

  return (
    <Sidebar className={cn('me:block hidden', sidebarClassName)}>
      {!type && (
        <SidebarHeader className="pt-3.5 pb-[50px]">
          <SidebarTrigger child={<Image src={Logo} alt="Zyptyk-logo" />} className="h-10 w-10" />
        </SidebarHeader>
      )}
      <SidebarContent className={sidebarContentClassName}>
        {getSidebarByRole(role, type).sidebarGroup.map((category) => (
          <SidebarGroup key={category.groupTitle}>
            <SidebarGroupLabel>{category.groupTitle}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {category.menu
                  .filter(({ only }) => !only || only === role)
                  .map(({ title, url, Icon, subMenu }) =>
                    subMenu ? (
                      <Collapsible className="group/collapsible" key={title}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              {Icon && <Icon />} {title}
                              <ChevronDown className="mr-1 ml-auto" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {subMenu.map(({ url, title }) => (
                                <SidebarMenuItem key={title}>
                                  <Link href={url}>
                                    <SidebarMenuButton
                                      key={title}
                                      title={title}
                                      isActive={pathName === url}
                                      className={'data-[active=true]/menu-action:before:opacity-0'}
                                    >
                                      {title}
                                    </SidebarMenuButton>
                                  </Link>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathName === url}
                          title={title}
                          className={sidebarTabClassName}
                        >
                          <Link href={url}>
                            {Icon && <Icon />} {title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ),
                  )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {!type && (
        <SidebarFooter>
          {!isAnAdmin && <ProfileCompletionCard />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="h-full">
                <AvatarComp name={userName} />
                <div className="flex flex-col text-xs font-medium">
                  <span>{userName}</span>
                  <span className="text-badge rounded-lg py-1.5">{getRole()}</span>
                </div>
                <EllipsisVertical className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <ProfileDropdownMenu />
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export const PhoneNavbar = ({ type }: SideBarProps): JSX.Element => {
  const role = useAppSelector(selectUserRole);
  const userName = useAppSelector(selectUserName);
  const pathName = usePathname();
  const flattenedMenu = getSidebarByRole(role, type).sidebarGroup.flatMap((group) => group.menu);
  const style =
    'h-full p-2 hover:bg-transparent data-[active=true]:bg-transparent relative before:absolute before:left-1/2 before:top-0 before:-translate-x-1/2 before:transform rounded-lg before:h-[3px] before:w-[30px] before:rounded before:bg-primary before:opacity-0 data-[active=true]/menu-action:before:opacity-100';

  return (
    <div className="me:hidden fixed bottom-0 z-50 flex h-[69px] w-full items-center justify-evenly gap-6 overflow-x-scroll bg-white">
      {flattenedMenu.map(({ title, Icon, phoneTitle, url }) => (
        <div key={title} title={title}>
          <SidebarMenuButton isActive={pathName === url} title={title} className={style}>
            <Link href={url} className="flex flex-col items-center justify-center">
              {Icon && <Icon size={24} />}
              <div>
                <span
                  className={cn(
                    'w-5 truncate text-xs font-bold',
                    pathName === url && 'text-primary',
                  )}
                >
                  {phoneTitle ?? title}
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </div>
      ))}
      <SidebarMenuButton title="your profile" className={cn(style, 'max-w-16 min-w-16')}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex flex-col items-center justify-center">
              <AvatarComp name={userName} />
            </div>
          </DropdownMenuTrigger>
          <ProfileDropdownMenu />
        </DropdownMenu>
      </SidebarMenuButton>
    </div>
  );
};

export const SettingsNavbar = (): JSX.Element => {
  const pathName = usePathname();
  const role = useAppSelector(selectUserRole);
  const flattenedMenu = getSidebarByRole(role, SidebarType.Settings).sidebarGroup.flatMap(
    (group) => group.menu,
  );

  return (
    <>
      <div className="me:hidden flex justify-evenly overflow-x-scroll bg-white">
        {flattenedMenu.map(({ title, phoneTitle, url }) => (
          <div key={title} title={title}>
            <SidebarMenuButton
              isActive={pathName === url}
              title={title}
              className="data-[active=true]/menu-action:z-50 data-[active=true]/menu-action:rounded-none data-[active=true]/menu-action:border-b-2 data-[active=true]/menu-action:border-primary data-[active=true]/menu-action:bg-transparent relative h-12 px-0 hover:bg-transparent"
            >
              <Link href={url} className="flex flex-col items-center justify-center px-2">
                <div>
                  <span
                    className={cn(
                      'w-5 truncate text-xs font-bold',
                      pathName === url && 'text-primary',
                    )}
                  >
                    {phoneTitle ?? title}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </div>
        ))}
      </div>
      <hr className="me:hidden relative mx-[2%] -mt-2.5 block w-auto border-b sm:mx-[5%]" />
    </>
  );
};

const ProfileDropdownMenu = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const logoutHandler = async (): Promise<void> => {
    await dispatch(logout());
    router.refresh();
  };

  return (
    <>
      <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
        <DropdownMenuItem>
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logoutHandler()}>
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </>
  );
};

const getSidebarByRole = (role?: Role, type?: SidebarType): ISidebar => {
  if (type === SidebarType.Settings) {
    switch (role) {
      case Role.Admin:
      case Role.SuperAdmin:
        return ADMIN_SETTINGS_SIDEBAR;
      case Role.Doctor:
        return DOCTOR_SETTINGS_SIDEBAR;
      default:
        return PATIENT_SETTINGS_SIDEBAR;
    }
  } else {
    switch (role) {
      case Role.Admin:
      case Role.SuperAdmin:
        return ADMIN_SIDE_BAR;
      case Role.Doctor:
        return DOCTOR_SIDE_BAR;
      default:
        return PATIENT_SIDE_BAR;
    }
  }
};
