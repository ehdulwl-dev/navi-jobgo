
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  gender: z.string().optional(),
  birthYear: z.string().optional(),
  birthMonth: z.string().optional(),
  birthDay: z.string().optional(),
  phone: z.string()
    .regex(/^\d+$/, "숫자만 입력해주세요")
    .max(11, "전화번호는 최대 11자리까지 입력 가능합니다")
    .optional(),
  address: z.string().optional(),
  addressDetail: z.string().optional(),
  email: z.string().min(1, "이메일을 입력해주세요"),
  emailDomain: z.string(),
  customDomain: z.string().optional(),
  password: z.string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "비밀번호는 영문, 숫자를 포함해야 합니다"),
  confirmPassword: z.string(),
  preferjob: z.array(z.string()).optional(),
  preferlocate: z.array(z.string()).optional(),
  prefertime: z.array(z.string()).optional(),
  personality: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});
