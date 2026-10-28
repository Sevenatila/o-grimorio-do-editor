export function Flourish({ className = '' }: { className?: string }) {
  return <svg className={`flourish ${className}`} viewBox="0 0 300 42" fill="none" aria-hidden="true"><path d="M8 21h94c23 0 29-16 48-16s25 16 48 16h94M90 21c19 0 24 15 40 15 12 0 20-15 20-15s8 15 20 15c16 0 21-15 40-15M138 21l12-12 12 12-12 12Z" stroke="currentColor"/><path d="M17 21c-16-22 37-20 25 0-9 14-30 4-21-3M283 21c16-22-37-20-25 0 9 14 30 4 21-3" stroke="currentColor"/></svg>
}

export function Corner({ className = '' }: { className?: string }) {
  return <svg className={`corner ${className}`} viewBox="0 0 72 72" fill="none" aria-hidden="true"><path d="M5 65V5h60M12 60V12h48M5 43c30-2 14-31 37-38M15 35c0-21 21-20 20-12-1 8-16 4-12-2M8 56c21-17 30-27 48-48M26 45c-12-20 10-22 9-11-1 6-6 7-9 11ZM45 26c-20-12-22 10-11 9 6-1 7-6 11-9Z" stroke="currentColor"/><path d="m8 8 7 7-7 7-7-7Z" fill="currentColor"/></svg>
}

export function FrameCorners() {
  return <><Corner className="top-left"/><Corner className="top-right"/><Corner className="bottom-left"/><Corner className="bottom-right"/></>
}

export function SkillSymbol({ kind }: { kind: string }) {
  const paths: Record<string, React.ReactNode> = {
    script: <><path d="M20 17h29v39H20c-10 0-10-12 0-12h23M20 17c-9 0-9 12 0 12h8M26 35h13M26 40h10M40 45l17-28 5 3-17 28-7 4Z"/></>,
    camera: <><rect x="12" y="24" width="48" height="32" rx="3"/><circle cx="36" cy="40" r="11"/><circle cx="36" cy="40" r="6"/><path d="m23 24 4-8h18l4 8M17 30h7"/></>,
    edit: <><circle cx="22" cy="52" r="7"/><circle cx="50" cy="52" r="7"/><path d="m27 46 29-32-5 19-14 13M45 46 16 14l5 19 14 13"/><circle cx="36" cy="37" r="2"/></>,
    color: <><circle cx="36" cy="26" r="15"/><circle cx="25" cy="44" r="15"/><circle cx="47" cy="44" r="15"/><path d="M36 13v48M12 44h48" opacity=".3"/></>,
    sound: <><path d="M12 34v8M20 27v22M28 20v36M36 12v52M44 23v30M52 29v18M60 35v6" strokeWidth="3"/></>,
    trend: <><path d="M14 58V43h9v15M31 58V33h9v25M48 58V22h9v36M12 32l17-15 12 6L60 9M48 9h12v12"/></>,
    time: <><path d="M20 12h32M20 60h32M24 12v10c0 8 12 10 12 14S24 42 24 50v10M48 12v10c0 8-12 10-12 14s12 6 12 14v10M28 21h16M29 53l7-8 7 8Z"/></>,
  }
  return <svg className="skill-symbol" viewBox="0 0 72 72" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="36" cy="36" r="34" strokeWidth=".5" opacity=".35"/>{paths[kind]}</svg>
}
