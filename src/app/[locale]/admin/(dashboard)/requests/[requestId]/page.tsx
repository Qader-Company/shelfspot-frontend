import { AdminRequestDetails } from "@/modules/admin/requests/details";
export default async function Page({params}:{params:Promise<{requestId:string}>}){const{requestId}=await params;return <AdminRequestDetails requestId={requestId}/>}
