import { Corner } from './Ornaments'

export function IlluminatedInitial({ letter }: { letter: string }) {
  return <span className="illuminated-initial"><Corner/><span>{letter}</span><Corner className="initial-end"/></span>
}

export function SectionHeading(props: { title: string; id: string } & ({ prelude: string } | { initial: string; continuation: string })) {
  const text = 'prelude' in props ? props.prelude.trimStart() : props.initial + (props.initial === 'O' ? ' ' : '') + props.continuation
  const match = text.match(/^(\p{L})([\s\S]*)$/u)
  return <h2 id={props.id} className="section-heading">{match && <IlluminatedInitial letter={match[1]}/>}<span className="heading-copy"><span className="heading-prelude">{match ? match[2] : text}</span>{' '}<span className="heading-title">{props.title}</span></span></h2>
}
