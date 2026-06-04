import z from "zod";
import { MIN_PLAN_PRICE } from "../../constants/common.constants";

export const planSchema = z.object({
  name: z.string().min(2, "Plan name is required"),
  price: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > MIN_PLAN_PRICE,
      `Invalid price. Minimum price is ${MIN_PLAN_PRICE}`,
    ),
  days: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Invalid duration",
    ),
});

export type PlanFormValues = z.infer<typeof planSchema>;
