"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProcessModal from "./ProcessModal"; 
import { buttonVariants } from "@/components/ui/button"; // 1. buttonVariants ইমপোর্ট করুন
import { cn } from "@/lib/utils"; // 2. ক্লাস মার্জ করার জন্য cn ইমপোর্ট করুন

export default function CustomizerSpotlight() {
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  return (
    <>
      <section className="py-20 bg-background border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Visual Side */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-secondary">
              <Image
                src="https://images.unsplash.com/photo-1683105653852-25028a53a3e4?q=80&w=1200"
                alt="Panjabi Customization Preview"
                fill
                className="object-cover object-[30%_85%] transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Content Side */}
            <div className="flex flex-col space-y-6">
              <h2 className="font-heading text-4xl md:text-5xl text-primary leading-tight">
                Your Design, <br /> Your Signature Style.
              </h2>
              <p className="font-sans text-lg text-muted-foreground max-w-lg">
                Craft your own Panjabi with our premium fabrics and precise tailoring.
                From collar designs to button details, every aspect is customized to your preference.
              </p>
              
              <div className="flex items-center gap-4 pt-4">
                {/* 3. <Button> এর বদলে সরাসরি <Link> ব্যবহার এবং buttonVariants কল করা হলো */}
                <Link 
                  href="/customize/new" 
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }), 
                    "font-sans cursor-pointer bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  Start Designing
                </Link>
                
                <button 
                  onClick={() => setIsProcessModalOpen(true)}
                  className="font-sans text-primary hover:text-accent font-medium hover:underline underline-offset-4 cursor-pointer"
                >
                  Learn Our Process →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProcessModal 
        isOpen={isProcessModalOpen} 
        onClose={() => setIsProcessModalOpen(false)} 
      />
    </>
  );
}