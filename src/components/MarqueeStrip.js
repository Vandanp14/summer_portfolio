import './MarqueeStrip.css';

/**
 * MarqueeStrip
 * ------------
 * One oversized outline-type statement that scrolls forever. CSS-only infinite
 * loop (duplicate group translated -50%). The second group is aria-hidden so
 * the phrase is announced once; reduced motion stops the drift (static, still
 * readable). Purely decorative band between sections.
 */
function MarqueeStrip({ words = [] }) {
  const renderGroup = (hidden) => (
    <div className="marquee-strip__group" aria-hidden={hidden || undefined}>
      {words.map((word, index) => (
        <span className="marquee-strip__cell" key={`${hidden ? 'b' : 'a'}-${word}-${index}`}>
          <span className="marquee-strip__word">{word}</span>
          <span className="marquee-strip__sep" aria-hidden="true">
            ·
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee-strip" role="presentation">
      <div className="marquee-strip__track">
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </div>
  );
}

export default MarqueeStrip;
