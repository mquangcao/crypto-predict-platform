import { GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface SocialLoginButton {
  provider: "google" | "keycloak";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const socialData: SocialLoginButton[] = [
  {
    provider: "google",
    label: "Login with Google",
    icon: GoogleIcon,
  },
];

interface SocialLoginButtonsProps {
  providers: SocialLoginButton[];
  onSocialLogin: (provider: "google" | "keycloak") => void;
  disabled?: boolean;
  className?: string;
}

export function SocialLoginButtons({
  providers,
  onSocialLogin,
  disabled,
  className,
}: SocialLoginButtonsProps) {
  return (
    <div className={`grid ${className || ""}`}>
      {providers.map(({ provider, label, icon: Icon }) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          className="h-11 font-medium text-[14px] hover:bg-accent cursor-pointer"
          onClick={() => onSocialLogin(provider)}
          disabled={disabled}
        >
          <Icon className="w-5 h-5 mr-2" />
          {label}
        </Button>
      ))}
    </div>
  );
}
