import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(9, "Password must be at least 9 characters."),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(9, "Password must be at least 9 characters long."),
    password_confirmation: z
      .string()
      .min(9, "Password confirmation must match the password."),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords must match.",
  });
