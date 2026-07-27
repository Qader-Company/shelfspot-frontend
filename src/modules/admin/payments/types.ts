export type PaymentStatus = "completed" | "failed" | "refunded";
export interface PaymentTransaction { id:string; companyName:string; country:string; amount:number; direction:"incoming"|"outgoing"; date:string; status:PaymentStatus }
