import "./States.css";

function ErrorState({ title = "Something went wrong", text = "Please try again.", actionText, onAction }) {
  return (
    <section className="state-box" role="alert">
      <h3 className="state-title">{title}</h3>
      <p className="state-text">{text}</p>
      {actionText && onAction ? (
        <button className="state-action" type="button" onClick={onAction}>
          {actionText}
        </button>
      ) : null}
    </section>
  );
}

export default ErrorState;
