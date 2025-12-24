import * as z from "zod"

const saudiPhoneRegex = /^((?:\+?966)|0)5[0-9]{8}$/

export const userSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(["Admin", "SuperAdmin"]).optional(),
  verificationCode: z.string().optional(),
  password: z.string().optional(),


})


export const userEditSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(["Admin", "SuperAdmin"]).optional(),
});
