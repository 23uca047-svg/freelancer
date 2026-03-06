import "./States.css";

function LoadingState({ title = "Loading...", text = "Please wait while data is being fetched." }) {
  return (
    <section className="state-box" role="status" aria-live="polite">
      <h3 className="state-title">{title}</h3>
      <p className="state-text">{text}</p>
      <div className="loading-row">
        <div className="loading-bar" />
        <div className="loading-bar short" />
        <div className="loading-bar" />
      </div>
    </section>
  );
}

export default LoadingState;
