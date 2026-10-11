import { Instagram, MessageCircle, Phone } from "lucide-react";

export type SocialPlatform = "instagram" | "facebook" | "whatsapp";

export function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return (
    <span className={`social-icon social-${platform}`} aria-hidden="true">
      {platform === "instagram" ? (
        <Instagram />
      ) : platform === "facebook" ? (
        <span className="facebook-letter">f</span>
      ) : (
        <span className="whatsapp-symbol">
          <MessageCircle />
          <Phone />
        </span>
      )}
    </span>
  );
}
