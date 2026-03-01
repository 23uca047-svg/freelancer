import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-column">
          <h4>Company</h4>
          <p>Careers</p>
          <p>Terms of Service</p>
          <p>Privacy Policy</p>
          <p>Investor Relations</p>
        </div>

        <div className="footer-column">
          <h4>Categories</h4>
          <p>Graphics & Design</p>
          <p>Digital Marketing</p>
          <p>Writing & Translation</p>
          <p>Video & Animation</p>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <p>Help & Support</p>
          <p>Trust & Safety</p>
          <p>Selling on Freelance</p>
          <p>Buying on Freelance</p>
        </div>

      </div>

      <div className="footer-bottom">
        <h3>freelance</h3>
        <p>© Freelance International Ltd. 2026</p>
      </div>
    </footer>
  );
}

export default Footer;