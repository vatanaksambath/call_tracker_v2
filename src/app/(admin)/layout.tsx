
"use client"; 

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect, useState } from "react"; // --- NEW: Import useEffect and useState ---
import { useRouter } from 'next/navigation'; // --- NEW: Import useRouter ---
import { jwtDecode } from 'jwt-decode'; // --- NEW: Import jwtDecode (ensure installed: npm install jwt-decode) ---

// This interface defines the expected shape of your JWT payload.
interface DecodedToken {
  user_id?: string;
  user_name?: string;
  email?: string;
  avatar?: string;
  exp?: number; 
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const router = useRouter(); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [loadingAuth, setLoadingAuth] = useState(true); 

  useEffect(() => {
    // Temporarily bypass authentication for development
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log("Development mode: bypassing authentication");
      setIsAuthenticated(true);
      setLoadingAuth(false);
      return;
    }

    const token = localStorage.getItem('token'); 

    if (!token) {
      console.log("No token found. Redirecting to signin.");
      router.push('/signin'); 
      setIsAuthenticated(false); 
      setLoadingAuth(false);
    } else {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.log("Token expired. Logging out from layout.");
          localStorage.removeItem('token'); 
          router.push('/signin'); 
          setIsAuthenticated(false);
        } else {        
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Invalid token in localStorage. Logging out from layout.", error);
        localStorage.removeItem('token'); 
        router.push('/signin'); 
        setIsAuthenticated(false);
      } finally {
        setLoadingAuth(false);
      }
    }
  }, [router]); 

  if (loadingAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-1 mx-auto md:p-6">{children}</div>
      </div>
    </div>
  );
}