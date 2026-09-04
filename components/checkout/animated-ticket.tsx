"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Truck, Wallet } from "lucide-react";

// --- SVG Icons ---

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);


const RazorpayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className="text-[#072654]"
  >
    <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.323-2.616 9.479 9.075-5.927L22.436 0zM1.564 24l11.91-7.773 1.174-4.276-6.625 4.323 2.616-9.479-9.075 5.927L1.564 24z" />
  </svg>
);

// --- Helper Components ---

const DashedLine = () => (
  <div
    className="w-full border-t-2 border-dashed border-[#161616]/15 my-4"
    aria-hidden="true"
  />
);

const Barcode = ({ value }: { value: string }) => {
  const hashCode = (s: string) =>
    s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  const seed = hashCode(value);
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const bars = Array.from({ length: 60 }).map((_, index) => {
    const rand = random(seed + index);
    const width = rand > 0.7 ? 2.5 : 1.5;
    return { width };
  });

  const spacing = 1.5;
  const totalWidth = bars.reduce((acc, bar) => acc + bar.width + spacing, 0) - spacing;
  const svgWidth = 250;
  const svgHeight = 65;
  let currentX = (svgWidth - totalWidth) / 2;

  return (
    <div className="flex flex-col items-center py-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        aria-label={`Barcode for order ${value}`}
        className="fill-current text-[#161616]"
      >
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width + spacing;
          return (
            <rect
              key={index}
              x={x}
              y="10"
              width={bar.width}
              height="45"
            />
          );
        })}
      </svg>
      <p className="text-[11px] font-mono text-neutral-500 tracking-[0.25em] mt-1.5 uppercase font-medium">
        {value}
      </p>
    </div>
  );
};

const ConfettiExplosion = () => {
  const confettiCount = 80;
  const colors = ["#7C7A5A", "#E694AA", "#E2D89B", "#B66F79", "#8F548C", "#FFF9F4"];

  return (
    <>
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-10vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: confettiCount }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2.5 h-4 rounded-xs"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${-20 + ((i * 13) % 10)}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${(i * 47) % 360}deg)`,
              animation: `fall ${2.5 + ((i * 7) % 25) / 10}s ${((i * 11) % 20) / 10}s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};

// --- Main Receipt Component ---

export interface OrderTicketProps extends React.HTMLAttributes<HTMLDivElement> {
  orderNumber: string;
  amountPaise: number;
  date?: Date;
  customerName: string;
  paymentMethod?: string; // 'RAZORPAY' | 'ONLINE' | 'COD' | 'WALLET'
  paymentId?: string | null;
  itemsCount?: number;
}

export const AnimatedTicket = React.forwardRef<HTMLDivElement, OrderTicketProps>(
  (
    {
      className,
      orderNumber,
      amountPaise,
      date = new Date(),
      customerName,
      paymentMethod = "ONLINE",
      paymentId,
      itemsCount = 1,
      ...props
    },
    ref
  ) => {
    const [showConfetti, setShowConfetti] = React.useState(false);

    React.useEffect(() => {
      const mountTimer = setTimeout(() => setShowConfetti(true), 100);
      const unmountTimer = setTimeout(() => setShowConfetti(false), 6000);
      return () => {
        clearTimeout(mountTimer);
        clearTimeout(unmountTimer);
      };
    }, []);

    const formattedAmount = `₹${(amountPaise / 100).toLocaleString("en-IN")}`;

    const formattedDate = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
      .format(date)
      .replace(",", " •");

    const getPaymentBadge = () => {
      const pm = (paymentMethod || "").toUpperCase();
      if (pm === "COD") {
        return (
          <div className="bg-[#7C7A5A]/5 p-3.5 rounded-xl border border-[#7C7A5A]/15 flex items-center space-x-3.5 text-left">
            <div className="w-9 h-9 bg-[#7C7A5A]/10 rounded-lg flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#7C7A5A]" />
            </div>
            <div>
              <p className="font-semibold text-xs text-[#161616] uppercase tracking-wider">Cash On Delivery</p>
              <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Pay upon package delivery</p>
            </div>
          </div>
        );
      }
      if (pm === "WALLET") {
        return (
          <div className="bg-[#7C7A5A]/5 p-3.5 rounded-xl border border-[#7C7A5A]/15 flex items-center space-x-3.5 text-left">
            <div className="w-9 h-9 bg-[#7C7A5A]/10 rounded-lg flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-[#7C7A5A]" />
            </div>
            <div>
              <p className="font-semibold text-xs text-[#161616] uppercase tracking-wider">RC Wallet Paid</p>
              <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Deducted from balance</p>
            </div>
          </div>
        );
      }
      // Online / Razorpay
      return (
        <div className="bg-[#7C7A5A]/5 p-3.5 rounded-xl border border-[#7C7A5A]/15 flex items-center space-x-3.5 text-left">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-[#161616]/10 shrink-0">
            <RazorpayIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-[#161616] uppercase tracking-wider">Razorpay Online Payment</p>
            <p className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">
              Ref: {paymentId ? paymentId.slice(-12) : "VERIFIED"}
            </p>
          </div>
        </div>
      );
    };

    return (
      <>
        {showConfetti && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-sm sm:max-w-md bg-white text-[#161616] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] border border-[#161616]/10 font-sans z-10 overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 duration-500",
            className
          )}
          {...props}
        >
          {/* Top Decorative Editorial Bar */}
          <div className="h-2 bg-[#7C7A5A] w-full" />

          {/* Ticket cut-out semi-circles */}
          <div className="absolute -left-4 top-[56%] -translate-y-1/2 w-8 h-8 rounded-full bg-[#F8F2EC] border-r border-[#161616]/10 z-20" />
          <div className="absolute -right-4 top-[56%] -translate-y-1/2 w-8 h-8 rounded-full bg-[#F8F2EC] border-l border-[#161616]/10 z-20" />

          {/* Top Confirmation Header */}
          <div className="p-8 pb-6 flex flex-col items-center text-center">
            <div className="p-3.5 bg-[#7C7A5A]/10 rounded-full animate-in zoom-in-50 delay-300 duration-500">
              <CheckCircleIcon className="w-10 h-10 text-[#7C7A5A] animate-in zoom-in-75 delay-500 duration-500" />
            </div>

            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#7C7A5A] mt-4 block">
              ORDER CONFIRMED
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-[#161616] mt-1">
              Thank You!
            </h1>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed font-sans max-w-xs">
              Your Lucknowi Chikankari garment is now being carefully prepared by our artisans.
            </p>
          </div>

          {/* Ticket Body Content */}
          <div className="px-8 pb-8 space-y-5">
            <DashedLine />

            {/* Order ID & Total Amount */}
            <div className="grid grid-cols-2 gap-4 text-left items-baseline">
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">ORDER NUMBER</p>
                <p className="font-mono text-xs font-semibold text-[#161616] mt-0.5 truncate">{orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">AMOUNT PAID</p>
                <p className="font-display text-2xl font-bold text-[#7C7A5A] mt-0.5">{formattedAmount}</p>
              </div>
            </div>

            {/* Customer & Date */}
            <div className="grid grid-cols-2 gap-4 text-left border-t border-[#161616]/5 pt-4">
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">RECIPIENT</p>
                <p className="font-medium text-xs text-[#161616] mt-0.5 line-clamp-1">{customerName || "Valued Patron"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">DATE & TIME</p>
                <p className="font-medium text-xs text-[#161616] mt-0.5">{formattedDate}</p>
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="pt-2">
              {getPaymentBadge()}
            </div>

            <DashedLine />

            {/* Barcode Section */}
            <Barcode value={orderNumber} />
          </div>
        </div>
      </>
    );
  }
);

AnimatedTicket.displayName = "AnimatedTicket";

export default AnimatedTicket;
