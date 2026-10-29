// Human-written English copy based on the existing Portuguese portfolio.
// Media, people, and factual claims remain shared with the original version.
export const englishDefaults = {
  general: { name: 'The Editor’s Grimoire', role: 'Video Editor & Storyteller', message: 'Hi, Marcos! I’d love to talk about the next chapter for my brand.' },
  navigation: { journey: 'My Story', portfolio: 'Portfolio', arsenal: 'My Craft', feedbacks: 'Testimonials', contact: 'Your Story' },
  hero: { title: 'Strategy, style, and emotion in every frame.', description: 'Video editing that turns ideas into stories that capture attention, build connection, and deliver results.', cta: 'Watch my showreel', tagline: 'The same passion. New horizons.', signature: 'Visual storytelling with purpose', videoTitle: 'The Editor’s Grimoire — Marcos', videoCategory: 'Showreel', videoDescription: '' },
  journey: {
    heading: { prelude: 'Where it all began', title: 'My Story' },
    paragraphs: [
      'Every great story starts somewhere. Mine began in 2024, editing videos for a friend’s açaí shop. What started as a quick favor showed me what video can really do: I saw firsthand how a well-made video could bring real customers through the door.',
      'That spark became my profession. Since then, I’ve refined my eye, developed my skills, and taken on bigger projects. Today, I’ve moved from açaí bowls to campaigns for businesses and corporations, helping brands establish a stronger presence online. The setting has changed and the tools have evolved, but the heart of it remains the same: a passion for stories that hold your attention and make you feel something.',
    ],
    alt: 'A sepia engraving of an anonymous artisan looking out over a medieval city, its towers and bridges.', caption: 'The setting changes. The passion stays.',
  },
  portfolio: {
    heading: { prelude: 'A collection of stories', title: 'Portfolio' }, intro: 'Explore a selection of projects brought to life through editing.', empty: 'New stories will be added soon.',
    videos: [
      { id: 'youtube-oF7MRtebWHs', title: 'Team Meeting & Coworking — Singlr', category: 'Shorts', description: '' },
      { id: 'youtube-9FwdP60SSpc', title: 'The Editor’s Grimoire — Marcos', category: 'Shorts', description: '' },
      { id: 'youtube-QstQJOrkq2k', title: 'A Career as a Digital Closer — Jesse', category: 'Shorts', description: '' },
      { id: 'youtube-rwz_finz-Y0', title: 'Digital Closer — Jesse', category: 'Shorts', description: '' },
      { id: 'youtube-fCXZFommLOA', title: 'What’s Changing in Brazil’s Tax System — TributeBem', category: 'Shorts', description: '' },
      { id: 'youtube-bnOoqp2OafA', title: 'The Transition Timeline and Its Stages — TributeBem', category: 'Shorts', description: '' },
    ],
  },
  arsenal: {
    heading: { prelude: 'Tools of the trade', title: 'My Grimoire' }, subtitle: 'How I bring your video to life.',
    intro: 'I don’t believe in cookie-cutter videos. I believe in bringing strategy and visual craft together. To create cinematic work that keeps people watching, I draw on skills across every stage of video production:',
    skills: [
      { title: 'Scripting & Storytelling', description: 'Before the camera rolls, there’s an idea. I write scripts that capture attention in the opening seconds and guide viewers toward taking action.' },
      { title: 'Filming', description: 'A trained eye for the angles, lighting, and movement that bring out the best in your brand.' },
      { title: 'Video Editing', description: 'Fast, precise editing that makes full use of CapCut Pro. I create dynamic sequences with engaging effects and cuts that follow the natural rhythm of human attention.' },
      { title: 'Color Grading', description: 'Thoughtful color correction and grading to create the right atmosphere and capture your brand’s mood.' },
      { title: 'Audio Post-production', description: 'Poor audio can ruin a great video. I deliver clear voices, immersive sound design, and music that sets the emotional pace.' },
      { title: 'Trend Research', description: 'I keep a close eye on what’s happening in the market, adapting emerging trends to your niche while keeping your brand’s voice original.' },
      { title: 'Project Management', description: 'Creativity works best with structure. I work with clear timelines, defined processes, and a firm commitment to meeting deadlines.' },
    ],
  },
  feedbacks: { heading: { prelude: 'Words from', title: 'My Clients' }, intro: 'Real feedback from people who have trusted me with their stories.', empty: 'New client feedback will be added soon.', originalNote: 'Screenshots show the original messages in Portuguese.', items: [] as { id: string; alt: string; text: string; role: string }[] },
  contact: { heading: { prelude: 'Let’s tell', title: 'Your Story' }, text: 'If you’re looking for an editor who simply pushes buttons, I may not be the right fit. But if you want a creative partner who understands attention, emotion, and conversion, let’s talk.', cta: 'Let’s write your next chapter', unavailable: 'WhatsApp contact will be available soon.', alt: 'An illustration of old books, a blank parchment scroll, a quill, and a lit candle on a wooden desk.', caption: 'Every great project starts\nwith a good conversation.' },
  footer: { description: 'Marcos · Video Editing & Storytelling', tagline: 'Stories made to stay with you.' },
}

export type EnglishContent = typeof englishDefaults
