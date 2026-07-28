import { z } from "zod";
export const adminSchema = (m: Record<"required"|"email"|"password"|"match", string>, edit: boolean) => z.object({ name: z.string().min(1,m.required), email: z.email(m.email), role: z.string().min(1,m.required), password: edit ? z.string() : z.string().min(8,m.password), active: z.boolean() });
export const roleSchema = (required:string) => z.object({name:z.string().min(1,required),permissions:z.array(z.string()),active:z.boolean()});
export type AdminForm = z.infer<ReturnType<typeof adminSchema>>; export type RoleForm = z.infer<ReturnType<typeof roleSchema>>;
