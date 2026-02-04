import { GoogleCallbackHandler } from "./google-callback-handler";
import { SuspenseWrapper } from "@/components/suspense-wrapper";

export default function GoogleCallbackPage() {
  return (
    <SuspenseWrapper>
      <GoogleCallbackHandler />
    </SuspenseWrapper>
  );
}
