"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getUserRole,
  isAuthenticated,
  logout,
} from "@/lib/auth";


export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggedIn, setLoggedIn] =
    useState(false);

  const [role, setRole] =
    useState<string | null>(null);

  useEffect(() => {
    const updateAuthState = () => {
      const authenticated =
        isAuthenticated();

      setLoggedIn(
        authenticated
      );

      setRole(
        authenticated
          ? getUserRole()
          : null
      );
    };

    updateAuthState();

    window.addEventListener(
      "storage",
      updateAuthState
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateAuthState
      );
    };
  }, [pathname]);


  const handleLogout = () => {
    logout();

    setLoggedIn(false);
    setRole(null);

    router.push("/");

    router.refresh();
  };


  const linkClass = (
    path: string
  ) =>
    `transition ${
      pathname === path
        ? "font-semibold"
        : ""
    }`;


  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <Link
          href="/"
          className="text-xl font-bold"
        >
          CivicPulse AI
        </Link>


        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <div className="flex items-center gap-5">

          {/* ----------------------------------------------- */}
          {/* PUBLIC / EXPLORE */}
          {/* ----------------------------------------------- */}

          <Link
            href="/dashboard"
            className={linkClass(
              "/dashboard"
            )}
          >
            Dashboard
          </Link>

          <Link
            href="/map"
            className={linkClass(
              "/map"
            )}
          >
            Map
          </Link>

          <Link
            href="/risk-map"
            className={linkClass(
              "/risk-map"
            )}
          >
            Risk Map
          </Link>

          <Link
            href="/analytics"
            className={linkClass(
              "/analytics"
            )}
          >
            Analytics
          </Link>

          <Link
            href="/disaster-center"
            className={linkClass(
              "/disaster-center"
            )}
          >
            Disaster Center
          </Link>

          <Link
            href="/assistant"
            className={linkClass(
              "/assistant"
            )}
          >
            AI Assistant
          </Link>


          {/* ----------------------------------------------- */}
          {/* AUTHENTICATED USERS */}
          {/* ----------------------------------------------- */}

          {loggedIn && (
            <>
              <Link
                href="/create-complaint"
                className={linkClass(
                  "/create-complaint"
                )}
              >
                Report Issue
              </Link>

              <Link
                href="/my-complaints"
                className={linkClass(
                  "/my-complaints"
                )}
              >
                My Complaints
              </Link>
            </>
          )}


          {/* ----------------------------------------------- */}
          {/* ADMIN */}
          {/* ----------------------------------------------- */}

          {loggedIn &&
            role === "admin" && (
              <Link
                href="/admin"
                className={linkClass(
                  "/admin"
                )}
              >
                Admin
              </Link>
            )}


          {/* ----------------------------------------------- */}
          {/* AUTH BUTTONS */}
          {/* ----------------------------------------------- */}

          {!loggedIn ? (
            <>
              <Link
                href="/login"
                className="rounded-lg border px-4 py-2"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg px-4 py-2"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="rounded-lg border px-4 py-2"
            >
              Logout
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}