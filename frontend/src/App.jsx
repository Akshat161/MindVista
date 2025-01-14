import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import HomePage from "./pages/home.page";
import Editor from "./pages/editor.pages";
import { createContext ,useState,useEffect} from "react";
import { lookInSession } from "./common/session";

export const UserContext = createContext({}) // we can use it anywhere in our code which is wrapped in its tag

const App = () => {

    const [userAuth,setUserAuth] =useState({});

    useEffect(()=>{

        let userInSession=lookInSession("user");

        userInSession ?setUserAuth(JSON.parse(userInSession)) : setUserAuth({access_token:null})
    },[])

    return (
   <UserContext.Provider value={ {userAuth,setUserAuth}}>

            <Routes>
                <Route path='/editor' element={<Editor/>} />
                <Route path="/" element={<Navbar />} >
                    <Route index element = {<HomePage/> } />
                    <Route path="/signin" element={< UserAuthForm type="sign-in" />} />
                    <Route path="/signup" element={< UserAuthForm type="sign-up" />} />
                </Route>
            </Routes>
        </UserContext.Provider>



    )
}

export default App;