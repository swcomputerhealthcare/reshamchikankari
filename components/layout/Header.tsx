import { getCurrentUser } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import Link from "next/link";
import CartDrawer from "@/components/cart/cart-drawer";
import HeaderSearch from "@/components/layout/HeaderSearch";
import AccountDropdown from "@/components/layout/AccountDropdown";
import NavbarLinks from "@/components/layout/NavbarLinks";
import MobileNav from "@/components/layout/MobileNav";
import StickyHeader from "@/components/layout/StickyHeader";

interface HeaderProps {
  variant?: "default" | "dark";
}

export default async function Header({ variant = "default" }: HeaderProps) {
  const user = await getCurrentUser();

  return (
    <StickyHeader variant={variant}>
      <Container className="w-full">
        {/* Desktop grid layout: 4 cols (left) | 4 cols (center) | 4 cols (right) */}
        <div className="hidden lg:grid grid-cols-12 items-center w-full">
          {/* Left Navigation (Home, Shop dropdown, Our Story) */}
          <div className="col-span-4 flex items-center gap-8">
            <NavbarLinks variant={variant} />
          </div>

          {/* Center Brand Logo (always points to /) */}
          <div className="col-span-4 flex items-center justify-center text-center">
            <Link
              href="/"
              className={`font-display text-2xl tracking-wider select-none hover:opacity-90 transition-opacity whitespace-nowrap ${
                variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"
              }`}
            >
              Resham Chikankari
            </Link>
          </div>

          {/* Right Utilities (Search, AccountDropdown, Wishlist, Cart) */}
          <div className="col-span-4 flex items-center justify-end gap-7">
            <HeaderSearch variant={variant} />
            <AccountDropdown user={user} variant={variant} />
            
            <Link
              href="/account/wishlist"
              className={`hover:text-brand-pink transition-colors text-[11px] uppercase tracking-widest font-medium font-sans whitespace-nowrap nav-link-underline ${
                variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"
              }`}
            >
              Wishlist
            </Link>
            
            <CartDrawer variant={variant} />
          </div>
        </div>

        {/* Mobile layout (Burger menu drawer, centered logo, search, cart bag icon) */}
        <div className="lg:hidden flex items-center justify-between w-full">
          <MobileNav user={user} variant={variant} />
        </div>
      </Container>
    </StickyHeader>
  );
}
