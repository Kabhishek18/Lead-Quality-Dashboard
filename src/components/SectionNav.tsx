const links = [
  { href: "#start", label: "Start" },
  { href: "#summary", label: "Summary" },
  { href: "#charts", label: "Charts" },
  { href: "#geo", label: "Geo" },
  { href: "#table", label: "Table" },
  { href: "#methodology", label: "Methodology" },
] as const;

export function SectionNav() {
  return (
    <nav className="section-nav" aria-label="Page sections">
      <ul className="section-nav-list">
        {links.map(({ href, label }) => (
          <li key={href}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
