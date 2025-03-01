import ReactDOM from "react-dom";

const Head = ({ children }: { children: React.ReactNode }) => {
  return ReactDOM.createPortal(children, document.head);
};

export default Head;
