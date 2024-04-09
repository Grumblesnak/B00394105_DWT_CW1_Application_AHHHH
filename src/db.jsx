import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

export const db = new Dexie("travel-photos");

db.version(1).stores({
  photos: "id",
});

async function addPhoto(id, imgSrc) {
  console.log("addPhoto", imgSrc.length, id);
  try {
    const i = await db.photos.add({
      id: id,
      imgSrc: imgSrc,
    });
    console.log("Photo ${imgSrc.length} bytes successfully added. Got id ${i}");
  } catch (error) {
    console.log("Failed to add photo: ${error}");
  }
  return (
    <>
      <p>
        {imgSrc.length} &nbsp; | &nbsp; {id}
      </p>
    </>
  );
}

async function GetPhotoSrc(id) {
  const img = await db.photos.where("id").equals(id).toArray();

  if (Array.isArray(img) && img.length > 0) {
    console.log("Retrieved image source:", img[0].imgSrc);
    return img[0].imgSrc;
  } else {
    throw new Error(`No image found with id: ${id}`);
  }
}

export { addPhoto, GetPhotoSrc };
