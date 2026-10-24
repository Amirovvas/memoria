import { AuthScreen } from "@/src/components/auth/AuthScreen"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <AuthScreen>{children}</AuthScreen>
}
