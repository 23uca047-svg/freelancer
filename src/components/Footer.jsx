import "./Footer.css";

const footerSections = [
  {
    title: "Company",
    links: ["Careers", "Terms of Service", "Privacy Policy", "Investor Relations"],
  },
  {
    title: "Categories",
    links: ["Graphics & Design", "Digital Marketing", "Writing & Translation", "Video & Animation"],
  },
  {
    title: "Support",
    links: ["Help & Support", "Trust & Safety", "Selling on Freelance", "Buying on Freelance"],
  },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {footerSections.map((section) => (
          <div key={section.title} className="footer-column">
            <h4>{section.title}</h4>
            {section.links.map((link) => (
              <p key={link}>{link}</p>
            ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <h3>freelance.</h3>
        <p>Copyright Freelance Marketplace Demo 2026</p>
      </div>
    </footer>
  );
}

export default Footer;
