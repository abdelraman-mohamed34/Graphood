import { z } from "zod"

export const RegisterInputsSchema = z.object({
    first_name: z.string().min(3, { message: "global.name_error" }),
    last_name: z.string().min(3, { message: "global.name_error" }),
    email: z.string().email(),
    password: z.string().min(6),
})

export type RegisterInputType = z.infer<typeof RegisterInputsSchema>