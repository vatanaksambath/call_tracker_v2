"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from 'axios';
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay"
import Link from "next/link";


export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [user_id, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();
  const currentPathname = usePathname();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; 

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      router.push('/');
    } else {
        router.push('/signin');
    }
  }, [token, router, currentPathname]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setUsernameError('');
    setPasswordError('');
    setLoginError('');

    let isValid = true;

    if (!user_id.trim()) {
      setUsernameError('Username is required.');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setLoading(true); 

    try {
      const response = await axios.post(`${API_BASE_URL}auth/login`, {
        user_id,
        password
      });

      const { token: receivedToken, message } = response.data;

      if (receivedToken) {
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);

        router.push('/');
      } else {
        setLoginError(message || 'Login successful, but no token received from API.');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setLoginError(error.response.data[0].message || 'Incorrect username or password.');
        console.error("Login API Error Response:", error.response.data[0].message);
      } else {
        setLoginError('An unexpected network error occurred. Please try again.');
        console.error("Login Network Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username">
                    Username <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    type="text"
                    value={user_id}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameError('');
                    }}
                    error={!!usernameError}
                    hint={usernameError}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      error={!!passwordError}
                      hint={passwordError}
                      required
                      disabled={loading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center justify-center cursor-pointer z-30"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                {loginError && (
                  <p className="text-error-500 text-sm mt-2 text-center">{loginError}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked}
                      disabled={loading}
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign in'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <LoadingOverlay isLoading={loading} />
    </div>
  );
}