import { z } from "zod";

export const gymSetupSchema = z.object({
  name: z.string().min(3, "Gym name must be at least 3 characters"),
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .refine((v) => v !== 0, "Please pin your gym location on the map"),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .refine((v) => v !== 0, "Please pin your gym location on the map"),
  gracePeriodDays: z
    .string()
    .refine((val) => !isNaN(Number(val)), "Invalid number"),
  onlinePaymentsEnabled: z.boolean(),
});

export type GymSetupFormValues = z.infer<typeof gymSetupSchema>;

export const trainerLinkSchema = z.object({
  trainerId: z.string().min(1, "Trainer is required"),
  memberId: z.string().min(1, "Member is required"),
});

export type TrainerLinkFormValues = z.infer<typeof trainerLinkSchema>;

export const membershipAssignSchema = z.object({
  email: z.string().email("Invalid email address"),
  planId: z.string().min(1, "Plan is required"),
});

export type MembershipAssignFormValues = z.infer<typeof membershipAssignSchema>;

export const exportSchema = z.object({
  from: z.string().optional().or(z.literal("")),
  to: z.string().optional().or(z.literal("")),
});

export type ExportFormValues = z.infer<typeof exportSchema>;
