export interface AdminService { id:string|number; key?:string; name?:string; title?:string; description?:string; minimum_price?:number|string; minimum_execution_time?:number|string; is_active?:boolean|number; active?:boolean }
export interface ServicePayload { description:string; minimum_price:number; minimum_execution_time:number; is_active:0|1 }
