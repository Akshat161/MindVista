import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/page-animation'
import InPageNavigation from '../components/inpage-navigation.component'
import Loader from "../components/loader.component"
import BlogPostCard from '../components/blog-post.component'
import MinimalBlogPost from '../components/nobanner-blog-post.component'
import { activeTabRef } from '../components/inpage-navigation.component'
import NoDataMessage from '../components/nodata.component'
import axios from 'axios'
import { filterPaginationData } from '../common/filter-pagination-data'

const HomePage = () => {

  let [blogs, setBlog] = useState(null);
  let [trendingBlogs, setTrendingBlog] = useState(null);
  let [pageState, setPageState] = useState("home");

  let categories = ['EdTechTrends','FutureOfAI','TechInEducation','AIJobs','TechInnovations','AIForCareers','DigitalLearning','TechTrends2025','AICareers',
    'EdTechAdvancements'];

  const fetchLatestBlogs = (page=1) => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs",{page})
      .then(async({ data }) => {

        console.log(data.blogs);

        let formatedData = await filterPaginationData({ 
          state :blogs,
          data: data.blogs,
          page,
          countRoute:'/all-latest-blogs-count'
        })

        console.log(formatedData);

        setBlog(formatedData)
      })
      .catch((err) => {
        console.log(err)
      })
  }


  const fetchBlogsByCategory = () => {

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState })
      .then(({ data }) => {
        setBlog(data.blogs)
      })
      .catch((err) => {
        console.log(err)
      })

  }

  const fetchTrendingBlogs = () => {
    axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlog(data.blogs)
      })
      .catch((err) => {
        console.log(err)
      })
  }


  const loadBlogByCategory = (e) => {

    let category = e.target.innerText; 
    setBlog(null);
  
    if (pageState === category.toLowerCase()) {
      setPageState('home');
      return;
    }
  
    setPageState(category.toLowerCase()); 
    
  };
  

  useEffect(() => {

    activeTabRef.current.click();

    if (pageState == 'home') {
      fetchLatestBlogs();
    }
    else {
      fetchBlogsByCategory();
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }


  }, [pageState])

  return (
    <AnimationWrapper>


      <section className='h-cover flex justify-center gap-10'>

        {/* latest Blogs */}
        <div className='w-full'>

          <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={['trending blogs']}>


            <>
              {
                blogs == null ? (<Loader/>) :
                  (
                    blogs.length ? (
                    blogs.map((blog, i) => {

                      return (<AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                        <BlogPostCard content={blog} author={blog.author.personal_info} />
                      </AnimationWrapper>

                      )
                    })
                  )
                  :<NoDataMessage message='No Blogs Published'/>
                  )
              }
            </>


          {
            trendingBlogs == null ? ( <Loader /> ):
            (
              trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => {
                return ( <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                  <MinimalBlogPost blog={blog} index={i} />
                </AnimationWrapper>
                )
              })
            )
            :
            <NoDataMessage message='No Trending Blogs Found'/>
           )
          }

          </InPageNavigation>
        </div>

        {/* filters and trending blogs  */}

        <div className='min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>

          <div className='flex flex-col gap-10'>


            <div>
              <h1 className='font-medium text-xl mb-8'>Stories from all interests</h1>

              <div className='flex gap-3 flex-wrap'>
                {
                  categories.map((category, i) => {
                    return <button onClick={loadBlogByCategory} className={'tag ' + (pageState === category.toLowerCase() ? 'bg-black text-white' : "")}
                      key={i}>
                      {category}
                    </button>

                  })
                }

              </div>
            </div>


            <div>

              <h1 className='font-medium text-xl mb-8'>Trending<i className='fi fi-rr-arrow-trend-up'></i></h1>

              {

                trendingBlogs == null ?( <Loader /> ):
                  (
                    trendingBlogs.length? (
                  trendingBlogs.map((blog, i) => {
                    return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  })
                ):
                (<NoDataMessage message='No Trending Blogs Found'/>)
                
                )

              }

            </div>

          </div>
        </div>

      </section>

    </AnimationWrapper>
  )
}

export default HomePage