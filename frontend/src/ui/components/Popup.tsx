import "./Popup.css";

function Popup({
  text,
  negative,
  setNegative,
  positive,
  setPositive,
}: {
  text: string;
  negative: string;
  setNegative: () => void;
  positive: string;
  setPositive: () => void;
}) {
  return (
    <div className="popupOverlay">
      <div className="popupContainer">
        <h2>{text}</h2>
        <div className="confirmationContainer">
          <button className="cancel" onClick={setNegative}>
            {negative}
          </button>
          <button className="confirm" onClick={setPositive}>
            {positive}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;
