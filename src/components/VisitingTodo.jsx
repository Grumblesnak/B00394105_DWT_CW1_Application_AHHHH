import { useEffect, useRef, useState, useCallback } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Webcam from "react-webcam";
import { addPhoto, GetPhotoSrc } from "../db.jsx";
import { saveAs } from "file-saver";

function VisitingTodo(props) {
  const [isEditing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageSrc = await GetPhotoSrc(props.id);
        console.log("Fetched image source:", imageSrc);
        setImgSrc(imageSrc);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchImage();
  }, [props.id]);

  function handleChange(e) {
    setNewName(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    props.editLocation(props.id, newName);
    setNewName("");
    setEditing(false);
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      console.log("Captured image source:", imageSrc);
      setImgSrc(imageSrc);
      addPhoto(props.id, imageSrc);
    } else {
      console.log("No webcam available");
    }
  }, [webcamRef, setImgSrc]);

  const viewPhoto = useCallback(() => {
    try {
      const imageSrc = GetPhotoSrc(props.id);
      setImgSrc(imageSrc);
    } catch (error) {
      alert("No photo found for this item.");
    }
  }, [props.id]);

  const editingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="todo-label" htmlFor={props.id}>
          New name for {props.name}
        </label>
        <input
          id={props.id}
          className="todo-text"
          type="text"
          value={newName}
          onChange={handleChange}
        />
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn todo-cancel"
          onClick={() => setEditing(false)}
        >
          Cancel
          <span className="visually-hidden"> renaming {props.name}</span>
        </button>
        <button type="submit" className="btn btn__primary todo-edit">
          Save
          <span className="visually-hidden"> new name for {props.name}</span>
        </button>
      </div>
    </form>
  );

  const viewTemplate = (
    <div className="stack-small">
      <div className="c-cb">
        <input
          id={props.id}
          type="checkbox"
          defaultChecked={props.completed}
          onChange={() => props.toggleLocationVisited(props.id)}
        />
        <label className="todo-label" htmlFor={props.id}>
          {props.name}
        </label>
      </div>
      <div className="btn-group">
        <button type="button" className="btn" onClick={() => setEditing(true)}>
          Edit <span className="visually-hidden">{props.name}</span>
        </button>
        <Popup
          trigger={
            <button type="button" className="btn">
              {" "}
              Take Photo{" "}
            </button>
          }
          modal
        >
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam"
            />
            <button onClick={capture}>Capture photo</button>
          </div>
        </Popup>

        <Popup
          trigger={
            <button type="button" className="btn">
              {" "}
              View Photo{" "}
            </button>
          }
          modal
        >
          <div>
            {imgSrc ? (
              <>
                <img src={imgSrc} alt="Snapshot" className="snapshot" />
                <button onClick={() => saveAs(imgSrc, "snapshot.jpeg")}>
                  Save Photo
                </button>
              </>
            ) : (
              <p>No photo available</p>
            )}
          </div>
        </Popup>
        <button
          type="button"
          className="btn btn__danger"
          onClick={() => props.deleteLocation(props.id)}
        >
          Delete <span className="visually-hidden">{props.name}</span>
        </button>
      </div>
    </div>
  );

  return (
    <li className="todo stack-small">
      {isEditing ? editingTemplate : viewTemplate}
    </li>
  );
}

export default VisitingTodo;
