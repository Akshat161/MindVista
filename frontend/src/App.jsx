import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import HomePage from "./pages/home.page";
import Editor from "./pages/editor.pages";
import { createContext, useState, useEffect } from "react";
import { lookInSession } from "./common/session";
import SearchPage from "./pages/search.page";
import ProfilePage from "./pages/profile.page";
import PageNotFound from './pages/404.page';
import BlogPage from "./pages/blog.page.jsx";
import ChangePassword from "./pages/change-password.page.jsx";
import SideNav from "./components/sidenavbar.component.jsx";
import EditProfile from "./pages/edit-profile.page.jsx";
import Notification from "./pages/notifications.page.jsx";
import ManageBlogs from "./pages/manage-blogs.page.jsx";


export const UserContext = createContext({}) // we can use it anywhere in our code which is wrapped in its tag

const App = () => {

    const [userAuth, setUserAuth] = useState({});

    useEffect(() => {

        let userInSession = lookInSession("user");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null })
    }, [])

    return (
        <UserContext.Provider value={{ userAuth, setUserAuth }}>
            <Routes>
                <Route path="/editor" element={<Editor />} />
                <Route path="/editor/:blog_id" element={<Editor />} />
                <Route path="/" element={<Navbar />} >
                    <Route index element={<HomePage />} />
                    <Route path="dashboard" element={<SideNav />}>
                        <Route path="blogs" element={<ManageBlogs />} />
                        <Route path="notifications" element={<Notification />} />
                    </Route>
                    <Route path="settings" element={<SideNav />} >
                      <Route path="edit-profile" element={<EditProfile />} />
                      <Route path="change-password" element={<ChangePassword />} />
                    </Route>
                    <Route path="/signin" element={< UserAuthForm type="sign-in" />} />
                    <Route path="/signup" element={< UserAuthForm type="sign-up" />} />
                    <Route path='search/:query' element={<SearchPage />} />
                    <Route path='user/:id' element={<ProfilePage />}></Route>
                    <Route path="blog/:blog_id" element={<BlogPage />} />
                    <Route path='*' element={<PageNotFound />} />
                </Route>
            </Routes>
        </UserContext.Provider>
    )
}

export default App;