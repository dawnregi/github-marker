import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useLogin } from "@/api/user/user.query";

const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();
  
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  return (
    <>
      <Helmet>
        <title>Login | Git Marker</title>
        <meta name="description" content="Log in to your Git Marker account to access your bookmarked repositories and manage your GitHub collections." />
      </Helmet>
      <div className="h-full w-full flex items-center justify-center px-4 py-4 overflow-y-auto bg-background">
     <div className="w-full sm:w-[95%] md:w-[550px] lg:w-[600px] xl:w-[700px] 2xl:w-[800px] space-y-4 my-auto max-h-full">

        {/* Login Card */}
        <Card className="p-8 border rounded-2xl">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-center text-foreground tracking-tight">
              Sign in
            </h1>
            <p className="text-center text-sm text-muted-foreground">
              Welcome back! Please enter your details
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <FieldGroup>
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

              {/* Password Input */}
              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                        Your password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
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
            </FieldGroup>

            {/* Login Button */}
            <Button
              type="submit"
              loading={loginMutation.isPending}
              className="w-full h-12 mt-2 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              Log in
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
                New to our application?
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => navigate({ to: '/auth/register' })}
            variant="secondary"
            className="w-full h-12 mt-2 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            Create an account
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
