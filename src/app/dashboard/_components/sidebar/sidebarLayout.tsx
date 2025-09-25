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
  PATIENT_RECORD_SIDEBAR,
  PATIENT_SETTINGS_SIDEBAR,
  PATIENT_SIDE_BAR,
} from '@/constants/sidebar.constant';
import { logout } from '@/lib/features/auth/authThunk';
import { useIsMobile } from '@/hooks/useMobile';

type SideBarProps = {
  type?: SidebarType;
  sidebarClassName?: string;
  sidebarContentClassName?: string;
  sidebarTabClassName?: string;
  hideOnMobile?: boolean;
};
export const SidebarLayout = ({
  type,
  sidebarClassName,
  sidebarContentClassName,
  sidebarTabClassName,
  hideOnMobile = false,
}: SideBarProps): JSX.Element => {
  const userName = useAppSelector(selectUserName);
  const isAnAdmin = useAppSelector(selectIsAnAdmin);
  const role = useAppSelector(selectUserRole);
  const pathName = usePathname();
  const isMobile = useIsMobile(1024);

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

  if (isMobile && hideOnMobile) {
    return <></>;
  }

  return (
    <Sidebar className={cn('flex hidden h-screen flex-col', sidebarClassName)}>
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
                  .map(({ title, url, Icon, subMenu, relatedUrl }) =>
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
                              {subMenu.map(({ url, title, relatedUrl }) => (
                                <SidebarMenuItem key={title}>
                                  <Link href={url}>
                                    <SidebarMenuButton
                                      key={title}
                                      title={title}
                                      isActive={
                                        pathName === url ||
                                        !!(relatedUrl && pathName.includes(relatedUrl))
                                      }
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
                          isActive={
                            pathName === url || !!(relatedUrl && pathName.includes(relatedUrl))
                          }
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
        <SidebarFooter className="me:block hidden flex-shrink-0">
          {!isAnAdmin && <ProfileCompletionCard />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="mt-4 py-10">
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

export const Navbar = ({
  type = SidebarType.Settings,
}: Pick<SideBarProps, 'type'>): JSX.Element => {
  const pathName = usePathname();
  const role = useAppSelector(selectUserRole);
  const flattenedMenu = getSidebarByRole(role, type).sidebarGroup.flatMap((group) => group.menu);

  return (
    <>
      <div className="me:hidden flex justify-evenly overflow-x-scroll bg-white p-2 pl-10">
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
  } else if (type === SidebarType.PatientRecord) {
    return PATIENT_RECORD_SIDEBAR;
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
