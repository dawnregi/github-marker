import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useRegister } from "@/api/user/user.query";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.email({ message: "Invalid email address" }),
  password: z.string()
    .min(1, "Password is required")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must be at least 8 characters with uppercase, lowercase, number, and special character"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      registerMutation.mutate(value);
    },
  });

  return (
    <>
      <Helmet>
        <title>Register | Git Marker</title>
        <meta name="description" content="Create a new Git Marker account to start bookmarking and organizing your favorite GitHub repositories." />
      </Helmet>
      <div className="h-full w-full flex items-center justify-center px-4 py-4 overflow-y-auto bg-background">
      <div className="w-full sm:w-[95%] md:w-[550px] lg:w-[600px] xl:w-[700px] 2xl:w-[800px] space-y-4 my-auto max-h-full">

        {/* Login Card */}
        <Card className="p-8 border rounded-2xl">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-center text-foreground tracking-tight">
              Create User
            </h1>
            <p className="text-center text-sm text-muted-foreground">
              Join us and start your journey today
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <FieldGroup>
              {/* Name Input */}
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                        Name
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="Enter your name"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="w-full h-12 px-4 rounded-md border-2 focus:ring-2 transition-all"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} className="text-sm text-destructive font-medium" />
                      )}
                    </Field>
                  );
                }}
              />

              {/* Email Input */}
              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                        Email
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="Enter your email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="w-full h-12 px-4 rounded-md border-2 focus:ring-2 transition-all"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} className="text-sm text-destructive font-medium" />
                      )}
                    </Field>
                  );
                }}
              />

              {/* Password Inputs */}
              <div className="flex flex-wrap gap-4">
                {/* Password Field */}
                <form.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="flex-1 min-w-[200px]">
                        <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                          Your password
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          placeholder="Enter your password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          className="w-full h-12 px-4 rounded-md border-2 focus:ring-2 transition-all"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} className="text-sm text-destructive font-medium" />
                        )}
                      </Field>
                    );
                  }}
                />

                {/* Confirm Password Field */}
                <form.Field
                  name="confirmPassword"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="flex-1 min-w-[200px]">
                        <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                          Confirm password
                        </FieldLabel>
                        <div className="relative">
                          <Input
                            id={field.name}
                            name={field.name}
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            className="w-full h-12 px-4 pr-12 rounded-md border-2 focus:ring-2 transition-all"
                          />
                          <Button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0! m-0! border-0! bg-transparent! hover:bg-gray-100! outline-none! rounded-lg! h-8! w-8! transition-colors"
                            style={{
                              padding: 0,
                              margin: 0,
                              border: 0,
                              background: "transparent",
                              borderRadius: "0.5rem",
                              height: "2rem",
                              width: "2rem",
                            }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <Eye className="w-5 h-5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} className="text-sm text-destructive font-medium" />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
            </FieldGroup>

            {/* Register Button */}
            <Button
              type="submit"
              loading={registerMutation.isPending}
              disabled={registerMutation.isPending}
              className="w-full h-12 mt-2 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Create Account
            </Button>
          </form>
        </Card>

        {/* Create Account Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground font-medium">
                Already have an account?
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => navigate({ to: '/auth/login' })}
            variant="outline"
            className="w-full h-12 mt-2 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
