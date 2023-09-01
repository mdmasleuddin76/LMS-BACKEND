import { model, Schema } from "mongoose";

const sch = new Schema({
  title: {
    type: String,
    required: [true, "Title is Required"],
    minLength: [8, "Title must be of atleast 8 Word"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
  },
  thumbnail: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  lectures: [
    {
      title: String,
      description: String,
      lecture: {
        public_id: {
          type: String,
        },
        secure_url: {
          type: String,
        },
      },
    },
  ],
  nooflecture:{
    type:Number,
    default:0
  },
  createdby:{
    type:String,
    required:[true,'Value required']
  }
},{timestamp:true});


export  default model('course',sch)