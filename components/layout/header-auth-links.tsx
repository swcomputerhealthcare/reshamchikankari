import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import LogoutLink from "@/components/auth/logout-link";
import Image from "next/image";

export default async function HeaderAuthLinks() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link
          href="/account"
          className="hover:text-brand-pink transition-colors duration-200"
        >
          Account
        </Link>
        <Link
          href="/login"
          className="hover:text-brand-pink transition-colors duration-200"
        >
          Login
        </Link>
      </>
    );
  }

  const displayName = user.name ? user.name.split(" ")[0] : "Profile";

  return (
    <>
      <Link
        href="/account"
        className="hover:text-brand-pink transition-colors duration-200 flex items-center gap-1.5"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={18}
            height={18}
            className="rounded-full object-cover aspect-square border border-brand-black/10"
          />
        ) : (
          <div className="w-[18px] h-[18px] rounded-full bg-[#3F5031]/10 text-[#3F5031] flex items-center justify-center font-bold text-[8px] border border-[#3F5031]/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span>{displayName}</span>
      </Link>
      <LogoutLink />
    </>
  );
}
