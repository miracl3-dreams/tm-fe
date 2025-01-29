import React, { useEffect, useState } from "react";
import axios from "../../utils/Axios";
import Cards from "../../components/Cards";
import { useSpring, animated } from "@react-spring/web";
import backgroundImg from "../../assets/images/background-image.jpg";

const Dashboard = () => {
  const [taskCount, setTaskCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  // Function to fetch task count
  const fetchTaskCount = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/tasks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        params: { per_page: 1 },
      });
      setTaskCount(response.data.meta.total || 0);
    } catch (error) {
      console.error("Failed to fetch task count:", error);
    }
  };

  // Function to fetch post count
  const fetchPostCount = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        params: { per_page: 1 },
      });

      const totalPosts = response.data?.meta?.total;
      setPostCount(totalPosts || 0);
    } catch (error) {
      console.error("Failed to fetch post count:", error);
    }
  };

  useEffect(() => {
    fetchTaskCount();
    fetchPostCount();
  }, []);

  const animatedTaskCount = useSpring({
    from: { number: 0 },
    to: { number: taskCount },
    delay: 200,
    config: { tension: 120, friction: 14 },
  });

  const animatedPostCount = useSpring({
    from: { number: 0 },
    to: { number: postCount },
    delay: 200,
    config: { tension: 120, friction: 14 },
  });

  return (
    <div
      className="relative flex flex-col items-center h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="py-7 px-5">
        <h1 className="text-4xl font-bold text-black flex items-center justify-center">
          Dashboard Page
        </h1>
      </div>
      <div className="flex justify-center items-center h-[65vh]">
        <div className="flex space-x-4">
          <Cards className="bg-blue-500 flex justify-center items-start border-2 border-black p-4">
            <p className="text-xl text-gray-700">
              Total Tasks:{" "}
              <animated.span className="font-semibold">
                {animatedTaskCount.number.to((n) => n.toFixed(0))}
              </animated.span>
            </p>
          </Cards>
          <Cards className="bg-green-500 flex justify-center items-start border-2 border-black p-4">
            <p className="text-xl text-gray-700">
              Total Posts:{" "}
              <animated.span className="font-semibold">
                {animatedPostCount.number.to((n) => n.toFixed(0))}
              </animated.span>
            </p>
          </Cards>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
