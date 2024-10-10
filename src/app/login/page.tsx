"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const { setUser, user } = useAuth();

  if (user) {
    router.push("/group");
  }

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...");
    try {
      const response = await axios.post(
        "http://localhost:2849/api/Users/Login",
        values
      );
      if (response.status === 200) {
        const token = response.data.token;

        // Store the token in a cookie
        document.cookie = `token=${token}; path=/; max-age=${
          30 * 24 * 60 * 60
        }; SameSite=Strict; ${
          process.env.NODE_ENV === "production" ? "Secure" : ""
        }`;

        // Update axios default headers
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Fetch user profile
        const profileResponse = await axios.get(
          "http://localhost:2849/api/Users/Profile"
        );
        if (profileResponse.status === 200) {
          setUser({ ...profileResponse.data, token });
          toast.success("Login successful!", { id: loadingToast });
          router.push("/group"); // Redirect to dashboard or home page
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        "Login failed. Please check your credentials and try again.",
        { id: loadingToast }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-12 dark:border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          <span className="text-black dark:text-white">spend</span>
          <span className="text-green-500">wise</span>
        </CardTitle>
        <p className="text-center text-gray-600">Sign in to your account</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your Email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter your Password"
                        type={passwordVisible ? "text" : "password"}
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              type="submit"
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" /> Sign In
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-green-500 hover:underline">
            Create an account
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
