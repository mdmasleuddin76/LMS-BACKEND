import multer from "multer";
import path from 'path'
const upload = multer({
  dest: "uploads",
  limits: { fileSize: 50 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter:(req,file,cb)=>{
  let ext=path.extname(file.originalname)
  if(
    ext!=='.jpg'&&
    ext!=='.jpeg'&&
    ext!=='.mp4'&&
    ext!=='.png'&&
    ext!=='.webp'
  ){
    cb(new Error(`unsupported File type ${ext}`),false)
  }
  cb(null,true);
  }
});

export default upload;
