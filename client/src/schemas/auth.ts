import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const adminRegisterSchema = z.object({
  gymName: z.string().min(3, "Gym name must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AdminRegisterFormValues = z.infer<typeof adminRegisterSchema>;

export const joinRegisterSchema = z.object({
  joinCode: z.string().min(1, "Join code is required").transform(v => v.trim()),
  role: z.enum(["MEMBER", "TRAINER"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type JoinRegisterFormValues = z.infer<typeof joinRegisterSchema>;
