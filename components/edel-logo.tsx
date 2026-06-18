import Image from "next/image";
import Link from "next/link";

export function EdelLogo({
  href = "/",
  showWordmark = true,
  className,
}: {
  href?: string;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className ?? ""}`}>
      <Image
        src="/EdelLogomark.svg"
        alt="Edel"
        width={32}
        height={32}
        priority
      />
      {showWordmark && (
        <Image
          src="/EdelLogotype.svg"
          alt="Edel"
          width={62}
          height={22}
          priority
        />
      )}
    </Link>
  );
}
