import { useState } from "react";

function VisitingForm(props) {
  const [name, setName] = useState("");

  function handleChange(event) {
    setName(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (name.trim() !== "") {
      props.addLocation(name);
      setName("");
    } else {
      alert("You can't visit that which is empty!");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="label-wrapper">
        <label htmlFor="new-todo-input" className="label__lg">
          What is a place you want to visit?
        </label>
      </h2>
      <input
        type="text"
        id="new-todo-input"
        className="location-input"
        name="text"
        autoComplete="off"
        value={name}
        onChange={handleChange}
      />
      <button type="submit" className="location-button">
        Add
      </button>
    </form>
  );
}

export default VisitingForm;
