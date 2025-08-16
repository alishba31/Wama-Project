'use client';
import Logo from '@/components/logo.svg';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br">
      <div className="text-center space-y-6">
        {/* Logo Section */}
        <div className="flex justify-center items-center space-x-4">
        <Image 
        src={Logo} 
        alt="Logo" 
        width={150} 
        height={150} 
        className="rounded-lg"
        />
        <h3 className="text-5xl font-bold tracking-tight">
          <span className="text-primary">Krypton</span>
          <br/>
          <span className="text-5xl text-gray-500">Solutions</span>
        </h3>
      </div>

        {/* Title Section */}
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200">
          Welcome to Equipment Warranty Portal
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Simplify your workflow with our comprehensive platform.
        </p>

        {/* Call to Action Section */}
        <div className="flex space-x-4 justify-center">
          <Button className="px-6 py-2 text-lg bg-primary hover:bg-blue-400 text-white">
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="absolute bottom-0 w-full text-center text-gray-500 dark:text-gray-400">
        {/* Divider Line */}
        <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />
        
        <div className="flex items-center justify-center space-x-4 mt-4">
          <p className="text-sm">Copyright © 2025 Krypton Solutions. All Rights Reserved.</p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}