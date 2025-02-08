import { useEffect, useContext,useRef, useState } from "react"
import { UserContext } from "../App"
import axios from "axios";
import profileDataStructure from "./profile.page"
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import InputBox from "../components/input.component";
import { storeInSession } from "../common/session";
const EditProfile =()=>{
   
    let{userAuth,userAuth:{access_token},setUserAuth}=useContext(UserContext);
    let bioLimit =150;

    let profileImgEle = useRef();
    let editProfileForm = useRef();

    const[profile,setProfile]=useState(profileDataStructure);
    const[loading,setLoading] = useState(true);
    const[charactersLeft,setCharactersLeft] = useState(bioLimit);
    const[updatedProfieImg,setUpdatedProfileImg] =useState(null);


    let{personal_info:{fullname,username:profile_username,profile_img,email,bio},social_links}=profile;

    useEffect(()=>{
     if(access_token){
        axios.post(import.meta.env.VITE_SERVER_DOMAIN+"/get-profile",{username:userAuth.username})
        .then(({data})=>{
        setProfile(data);
        setLoading(false)
        })
        .catch(err=>{
            console.log(err);
        })
     }
    },[access_token])

    const handleCharacterChange=()=>{
        setCharactersLeft(bioLimit-e.target.value.length)
    }
    const handleImagePreview=(e)=>{
        let img = e.target.files[0];
        profileImgEle.current.src=URL.createObjectURL(img);
        setUpdatedProfileImg(img);

    }
    const handleImageUpload = (e)=>{
     e.preventDefault();
     if(updatedProfieImg){
        let loadingToast = toast.loading("Uploading....");
        e.target.setAttribute("disabled",true);

        uploadImage(updatedProfieImg)
        .then(url=>{
            if(url){
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",{url:url},{
                    headers:{
                        'Authorization':`Bearer ${access_token}`
                    }
                })
                .then(({data})=>{
                    let newUserAuth = {...userAuth,profile_img:data.profile_img}
                    storeInSession("user",JSON.stringify(newUserAuth))
                    setUserAuth(newUserAuth);

                    setUpdatedProfileImg(null);
                    toast.dismiss(loadingToast);
                    e.target.removeAttribute("disabled");
                    toast.success("Uploaded");
                })
                .catch(({response})=>{
                    toast.dismiss(loadingToast);
                    e.target.removeAttribute("disabled");
                    toast.error(response.data.error);
                })
            }
        })
        .catch(err=>{

        })
     }
    }

   const handleSubmit =(e)=>{
      e.preventDefault();

      let form = new FormData(editProfileForm.current);
      let formData={};

      for(let[key,value] of form.entries()){
        formData[key] = value;
      }
      let {username,bio,youtube,facebook,twitter,github,instagram , website}=formData;

      if(username.length<3){
        return toast.error("Username should be at least 3 letters long")
      }

      if(bio.length>bioLimit){
        return toast.error(`Bio should not be more than ${bioLimit}`)
      }

      let loadingToast =toast.loading("Updating .....")
      e.target.setAttribute("disabled",true)

      axios.post(import.meta.env.VITE_SERVER_DOMAIN+"/update-profile",{
        username,bio,
        social_links:{youtube,facebook,twitter,github,instagram , website}},{
            headers:{
                "Authorization":`Bearer ${access_token}`
            }
   })
        .then(({data})=>{
            if(userAuth.username != data.username){
                let newUserAuth ={...userAuth,username:data.username};

                storeInSession("user",JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);
            }

            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.success("Profile Updated");

        })
        .catch(({response})=>{
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.error(response.data.error);
            
        })

   }
    return(
        <AnimationWrapper>
            {
           loading?<Loader/>:
           <form ref={editProfileForm.current}>
            <Toaster/>

            <h1 className="max-md:hidden">Edit Profile</h1>
            <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
                <div className="max-lg:center mb-5">
                    <label htmlFor="uploadImg" id="profileImgLabel" className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden ">

                        <div className="w-full h-full absolute top-0 left-0 flrx itrs-center justify-center text-white bg-black/80 opacity-0 hover:opacity-100 cursor-pointer"> Upload Image</div>
                   <img ref={profileImgEle} src={profile_img}/>
                    </label>

                    <input type="file" id="uploadImg" accepted=".jpeg,.png,.jpg" hidden onChange={handleImagePreview}/>

                  <button className="btn-light mt-5 max-lg:current lg:w-full px-10" onClick={handleImageUpload}>Upload</button>
                  <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                        <div>
                            <InputBox name = "fullname" type="text" value={fullname} placeholder="Full Name" disable={true} icon = "ff-rr-user"/>
                        </div>
                        <div>
                        <InputBox name = "email" type="text" value={email} placeholder="Email" disable={true} icon = "ff-rr-envelope"/>
                        
                        </div>
                    </div>
                    <InputBox type="text" name="username" value={profile_username} placeholder="username" icon="ff-rr-at"/>
                  </div>
                    
                 <p className="text-dark-grey -mt-3">Username will use to search use to search user and will be visiblee to all users</p>


                <textarea name="bio" maxLength={bioLimit} defaultValue={bio}className="input-box h-64 lg:h-40 resize-none leading-? mt-5 pl-5" placeholder="Bio" onClick={handleCharacters}></textarea>

                <p className="mt-1 text-dark-grey">{charactersLeft}charactersLeft</p>
               
               <p className="my-6 text-dark-grey">
                Add your social media handles
               </p>

               <div className="md:grid md:grid-cols-2 gap-x-6">
                {

                Object.keys(social_links).map((key,i)=>{
                    let link = social_links[key];
                   
                   
                    return  <InputBox key={i} name={key} type="text" vlaue={link} placeholder="https://" icon={"fi"+ (key!='website'? "fi-brands-"+key:"fi-rr-globe")}/>              })

                }
                
               </div>
            <button className="btn-dark w-auto px-10" type="submit" onClick={handleSubmit}>Update</button>
                </div>
            </div>
           </form>
}
        </AnimationWrapper>
            
    )
}

export default EditProfile