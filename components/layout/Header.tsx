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
        {/* Desktop grid layout: 5 cols (left) | 2 cols (center) | 5 cols (right) */}
        <div className="hidden lg:grid grid-cols-12 items-center w-full">
          {/* Left Navigation (Home, Shop dropdown, Our Story, Reviews, Contact) */}
          <div className="col-span-5 flex items-center gap-7 whitespace-nowrap">
            <NavbarLinks variant={variant} />
          </div>

          {/* Center Brand Logo (always points to / and mathematically centered) */}
          <div className="col-span-2 flex items-center justify-center text-center">
            <Link
              href="/"
              className={`font-display text-[22px] sm:text-2xl tracking-wide select-none hover:opacity-90 transition-opacity whitespace-nowrap font-normal ${
                variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"
              }`}
            >
              Resham Chikankari
            </Link>
          </div>

          {/* Right Utilities (Search, AccountDropdown, Wishlist, Cart) */}
          <div className="col-span-5 flex items-center justify-end gap-6 whitespace-nowrap">
            <HeaderSearch variant={variant} />
            <AccountDropdown user={user} variant={variant} />
            
            <Link
              href="/account/wishlist"
              className={`hover:text-brand-pink transition-colors text-[11px] uppercase tracking-[0.16em] font-medium font-sans whitespace-nowrap ${
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
