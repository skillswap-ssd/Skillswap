import { EmptyState } from "@/components/ui/empty-state";import { Skeleton } from "@/components/ui/skeleton";import { Card } from "@/components/ui/card";
export function LoadingState({label="Loading SkillSwap context…"}:{label?:string}){return <Card><Skeleton/><p className="mt-3 font-bold">{label}</p></Card>}
export function ErrorState({label="Something got in the way."}:{label?:string}){return <EmptyState title={label} body="This mock experience is still available; try clearing filters or returning to discovery."/>}
