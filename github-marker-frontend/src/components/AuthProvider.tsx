import { useMe } from '@/api/user/user.query';
import LoadingFallback from '@/components/LoadingFallback';

type AuthProviderProps = {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoading } = useMe();


  if (isLoading) {
    return <LoadingFallback />;
  }

  return <>{children}</>;
}
