import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '认证 - AI n8n',
  description: '登录或注册AI n8n账户',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 