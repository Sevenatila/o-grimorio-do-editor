import { Corner } from './Ornaments'

export function IlluminatedInitial({ letter }: { letter: string }) {
  return <span className="illuminated-initial"><Corner/><span>{letter}</span><Corner className="initial-end"/></span>
}

export function SectionHeading({ initial, continuation, title, id }: { initial: string; continuation: string; title: string; id: string }) {
  return <h2 id={id} className="section-heading"><IlluminatedInitial letter={initial}/><span className="heading-copy"><span className="heading-prelude">{initial === 'O' ? ' ' : ''}{continuation}</span>{' '}<span className="heading-title">{title}</span></span></h2>
}
