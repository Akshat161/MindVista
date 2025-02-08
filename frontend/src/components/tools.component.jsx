import Embed from '@editorjs/embed';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import Inlinecode from '@editorjs/inline-code';

const uploadImageOnCloudinary = async (file) => {
    
    const formData = new FormData();
    formData.append('file', file);
  
    const response = await fetch(import.meta.env.VITE_SERVER_DOMAIN +"/uploadImageInBlog", {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error('Failed to upload to Cloudinary');
    }
  
    const data = await response.json();
    return data.file.url; // Return the Cloudinary URL
  };

  
export const uploadImageByFile = async (file) => {
    try {
      const url = await uploadImageOnCloudinary(file);
      return {
        success: 1,
        file: { url },
      };
    } catch (err) {
      console.error(err);
      return {
        success: 0,
        message: 'Failed to upload image',
      };
    }
  };
  
  
const uploadImageByURL=(e)=>{

    let link = new Promise((resolve,reject)=>{

        try{
            resolve(e)
        }
        catch(err){
            reject(err)
        }
    })

    return link.then((url)=>{
        return{

            success:1,
            file:{url}
        }
    })
}

export const tools =  {

    embed:Embed,
    list:{
        class:List,
        inlineToolbar: true
    },

    image:{
        class:Image,
         config:{
            uploader:{
                uploadByUrl:uploadImageByURL,
                uploadByFile:uploadImageByFile,
            }
         }
    },
    header:{
        class:Header,
        config:{
            placeholder:"Type Heading...",
            levels:[2,3],
            defaultLevel:2
        }
    } ,
    quote:{
        class:Quote,
        inlineToolbar: true
    } ,

    marker: Marker,

    Inlinecode: Inlinecode

}

