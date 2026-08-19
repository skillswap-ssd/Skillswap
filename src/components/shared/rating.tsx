export function Rating({value}:{value:number}){return <span aria-label={`${value} reputation`} className="font-bold text-[var(--warning)]">★ {value.toFixed(1)}</span>}
