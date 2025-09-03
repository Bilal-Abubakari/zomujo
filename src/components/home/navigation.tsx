import Link from 'next/link';
import { JSX } from 'react';
import { useQueryParam } from '@/hooks/useQueryParam';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AvatarComp } from '@/components/ui/avatar';
import { logout } from '@/lib/features/auth/authThunk';
import { useRouter } from 'next/navigation';

export const Navigation = (): JSX.Element => {
  const { hasSearchParams } = useQueryParam();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const logoutHandler = async (): Promise<void> => {
    await dispatch(logout());
    router.refresh();
  };

  if (user) {
    return (
      <nav>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-10 w-10 overflow-hidden rounded-full">
              <AvatarComp
                name={`${user.firstName} ${user.lastName}`}
                className="h-10 w-10 text-black"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => router.push('/dashboard')}>
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logoutHandler}>
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    );
  }

  return (
    <nav>
      <Link href="/login">
        <span
          className={cn(
            hasSearchParams ? 'text-primary' : 'text-white hover:bg-gray-100',
            'mr-2 cursor-pointer rounded-md px-4 py-2',
          )}
        >
          Login
        </span>
      </Link>
      <Link href="/sign-up">
        <span className="bg-primary rounded-md px-4 py-2 text-white hover:bg-gray-500">
          Sign Up
        </span>
      </Link>
    </nav>
  );
};
