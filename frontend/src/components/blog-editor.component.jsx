import { Link , useNavigate, useParams } from "react-router-dom";
import logo from '../imgs/logomv1.png';
import AnimationWrapper from "../common/page-animation";
import defBanner from '../imgs/blog banner.png';
import { useContext, useEffect, useState } from "react";
import {EditorContext} from '../pages/editor.pages.jsx'
import EditorJS from '@editorjs/editorjs'
import { tools } from "./tools.component.jsx";
import { Toaster, toast } from 'react-hot-toast';
import axios from "axios";
import { UserContext } from "../App.jsx";

const BlogEditor = () => {

    const [isUploading, setIsUploading] = useState(false); // State to manage upload status

    let {blog, blog:{ title, banner, content ,tags,des },setBlog,textEditor,setTextEditor,setEditorState}=useContext(EditorContext);

    let {userAuth:{access_token}} =useContext(UserContext)
    let{blog_id}=useParams();

    let navigate=useNavigate();

    useEffect(()=>{
        if(!textEditor.isReady){
            setTextEditor(new EditorJS({
                holderId:'textEditor',
                data:Array.isArray(content) ? content[0]:content,
                tools:tools,
                placeholder:"Let's write something awesome "
            }))
        }
    },[])

    const handleBannerUpload = async (e) => {

        const file = e.target.files[0]; // Get the selected file

        if (!file) {
            alert("No file selected.");
            return;
        }

        // Update banner preview
        const previewURL = URL.createObjectURL(file);
        setBlog({...blog,banner:previewURL});

        try {
            setIsUploading(true); // Show uploading status

            const formData = new FormData();
            formData.append("banner", file); // Ensure the key matches the backend


            // Send the file to the backend
            const response = await fetch(import.meta.env.VITE_SERVER_DOMAIN +"/uploadBanner", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            console.log("Upload successful!");

           

            // Update the banner to the uploaded image URL
            setBlog({...blog,banner: result.banner}); 

        } catch (error) {
            console.error("Error uploading banner:", error);
           
        } finally {
            setIsUploading(false); // Reset uploading status
        }
    };

    const handelTitleKeydown =(e)=>
    {
        if(e.keyCode==13)
            {
                e.preventDefault();
            }
    }

    const handelTitleChange=(e)=>{

        // console.log(e);

        let input =e.target;
        input.style.height='auto';
        input.style.height=input.scrollHeight+'px';

        setBlog({...blog, title:input.value})

    }

    const handelError=(e)=>{
        let img=e.target;
        img.src=defBanner;
    }

    const handelPublishEvent=()=>{
        if(!banner.length){
            return toast.error('upload a Blog Banner before publishing')
        }

        if(!title.length){
            return toast.error('upload a Blog Title before publishing')
        }

        if(textEditor.isReady){
            textEditor.save().then((data)=>{
                if(data.blocks.length){
                    console.log(data)
                    setBlog({...blog, content: data });
                    setEditorState('publish')
                }
                else{
                    return toast.error('write something in your blog before publishing')
                }
            })
        }
    }

    const handleSaveDraft=(e)=>{


        if(e.target.classList.contains('disable')){
            return;
        }

        if(!title.length){
            return toast.error('Write blog title before saving it as a draft')
        }


        let loadingToast = toast.loading('Saving Draft ....');

        e.target.classList.add('disable');

        if(textEditor.isReady){
            textEditor.save().then(content=>{

                let blogObj={
                    title,banner,des,content,tags,draft:true
                }
        
                axios.post(import.meta.env.VITE_SERVER_DOMAIN+"/create-blog",{...blogObj,id:blog_id},{
                    headers:{
                        'Authorization':`Bearer ${access_token}`
                    }
                })
                .then(()=>{
        
                    e.target.classList.remove('disable');
        
                    toast.dismiss(loadingToast);
                    toast.success('Saved ')
        
                    setTimeout(()=>{
                       navigate('/')
                    },500);
                })
                .catch(({ response})=>{
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
        
                    return toast.error(response.data.error)
        
                })

            })
        }

        
    }

    return (
        <>
         <Toaster/>
            <nav className="navbar">
                <Link to="/" className="flex-none w-15 h-20">
                    <img src={logo} alt="Logo" />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">{ title.length? title:'New Blog' }</p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2"
                            onClick={handelPublishEvent}
                    >Publish</button>
                    <button className="btn-light py-2"
                            onClick={handleSaveDraft}
                    >Save Draft</button>
                </div>
            </nav>

            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                            <label htmlFor="uploadBanner">
                                <img
                                    src={banner}
                                    alt="Banner"
                                    className={`z-20 ${isUploading ? "opacity-50" : ""}`}
                                    onError={handelError}
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                        <p className="text-white">Uploading...</p>
                                    </div>
                                )}
                                <input
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>

                        <textarea
                           defaultValue={title}
                           placeholder="Blog Title"
                           className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 "
                           onKeyDown={handelTitleKeydown}
                           onChange={handelTitleChange}
                        > 
                        </textarea>

                        <hr className="w-full opacity-20 my-5"/>

                        <div id='textEditor' className="font-gelasio">

                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    );
};

export default BlogEditor;