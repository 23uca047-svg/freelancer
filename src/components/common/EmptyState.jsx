import "./States.css";

function EmptyState({ title = "No data available", text = "Try a different filter or search." }) {
  return (
    <section className="state-box">
      <h3 className="state-title">{title}</h3>
      <p className="state-text">{text}</p>
    </section>
  );
}

export default EmptyState;
