import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "The Art of Chikankari — About Resham Chikankari",
  description: "Explore the centuries-old tradition of hand-embroidery, Awadh heritage, and quiet luxury at Resham Chikankari.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FFF9F4] text-[#1b1c19] min-h-screen font-sans selection:bg-[#3F5031] selection:text-[#FFF9F4]">
      <main className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 pt-8 pb-20 sm:pb-32 space-y-20 sm:space-y-32">
        {/* Hero Section */}
        <section className="min-h-[600px] lg:min-h-[700px] flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-16 pt-6">
          {/* Left Text */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6 text-left md:pr-6">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#E58FA7]">
              OUR HERITAGE
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#3F5031] leading-tight">
              THE ART OF<br />CHIKANKARI
            </h1>
            <p className="font-sans text-base sm:text-lg text-[#44483f] max-w-xl leading-relaxed">
              A legacy woven in white thread. We explore the centuries-old tradition of hand-embroidery, bringing quiet luxury to modern silhouettes.
            </p>
            <div className="h-px w-24 bg-[#161616] mt-4" />
          </div>

          {/* Right Hero Image */}
          <div className="w-full md:w-1/2 h-[400px] sm:h-[530px] md:h-[650px] relative overflow-hidden rounded-2xl border border-[#161616]/10 shadow-xs">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxrnw9-wfAuHaTIxk8y3p5cNoTVEeTY7OoJJ1mpiANYrekvd5kRO5nRpj2ZGUxjma-v3XhHIbkiVugrh96vAaJrDBmQpTxQFaxLV6UaF9g2w6w2ndzWVGTFt3RChrvb21YF7ZiN_aqtJG3GKLUbJu9aXE7zuqdQraNFWTAsvqqypROOx5etS-S158CQTcV6zGtz1hh6o93ZtOQdnee0D7Lj4lKhNUI87Enr6pUXU8r9wKvWJc42g4u"
              alt="Master artisan embroidering Chikankari floral motifs on sheer fabric"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </section>

        {/* Editorial Block 1: The Origin */}
        <section className="flex flex-col-reverse md:flex-row items-center gap-10 lg:gap-16 text-left">
          {/* Left Image */}
          <div className="w-full md:w-1/2 h-[380px] sm:h-[500px] md:h-[600px] relative overflow-hidden rounded-2xl border border-[#161616]/10 shadow-xs">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR5i2mYx7NYZtw61ryYk22uY4xdSdaKkfTUYbjUE9Qi8YfpEl4TTsowke5jJz9ru_EWsmZd5FcCFDAZjddA0Z-kIVhNxBDPrd1yS3iHfROHBBnW-ofqg6ZBlYaSxZlP-sYQiRKRxNccEZiU7xY0XJdrCnoLs11qTQPcC9kIWz71oNLaIcqvSTgA_aarXd9efKB-fSzUxbWXoB6KzgoGwsIhJQGx46hbPVNLzsKld79Ko6bzH085LIz"
              alt="Architectural silhouetted elegance of Lucknow at dawn"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Right Text */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6 md:pl-6">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#E58FA7]">
              01 / The Origin
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#3F5031]">
              A CITY&apos;S SOUL
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#44483f] max-w-lg leading-relaxed">
              Born in the royal courts of Awadh, Chikankari is more than an embellishment; it is the poetry of Lucknow captured in thread. Every stitch whispers tales of Nawabi elegance, a tradition passed down through generations of skilled artisans who continue to breathe life into pristine fabrics.
            </p>
          </div>
        </section>

        {/* Editorial Block 2: The Process */}
        <section className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 p-8 sm:p-14 bg-[#efeee9]/70 rounded-3xl border border-[#161616]/10 text-left">
          {/* Left Text */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6 md:pr-6">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#E58FA7]">
              02 / The Process
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#3F5031]">
              METICULOUS PRECISION
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#44483f] max-w-lg leading-relaxed">
              True luxury requires time. Our process begins with the careful selection of sheer cotton and georgette, followed by the block-printing of intricate motifs. The true magic lies in the hands of the embroiderers, who employ over thirty distinct stitches to create patterns of breathtaking complexity and sublime subtlety.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-2 font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#161616] pb-1 border-b border-[#161616] hover:text-[#3F5031] hover:border-[#3F5031] transition-colors group"
            >
              Explore Artisanal Collection <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 h-[380px] sm:h-[500px] md:h-[600px] relative overflow-hidden rounded-2xl border border-[#161616]/10 shadow-xs">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsO8ZUZDIgRHr0Tv9flH_ZoQeM0hGtZjfQydnOQAB48YfZOo-wwS-ugrYLEqyC4UNHnqXbB37r8vFHvuuQvKH34d_miyeU5s5Y0Swy0wMQtfmGcqs95BSUJJOsW9x3RPZEkY35okBSRgCXfmJBXnp4ngGyhVsa21ee1ncIvW4JStS8PhLqoE4w9MyDIT3F5Bmyuk5Ue0VR9_oLZsB0nGQS4kGkFlURGw_4hZuq7cd0INiw09UvnsI0"
              alt="Wooden printing blocks, cotton thread spools, and sheer Lucknowi textiles"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
