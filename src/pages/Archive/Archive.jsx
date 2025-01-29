import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { toast, Bounce } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "../../utils/Axios";
import backgroundImg from "../../assets/images/background-image.jpg";

const Archive = () => {
  // State hooks
  const [Blank, setTrashedTasks] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [trashedTasksPerPage] = useState(5);
  const [status] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [message, setMessage] = useState("");

  // Routing & Authentication
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  // Authentication headers
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  // Fetch trashed tasks from API
  const fetchTrashedTasks = async ({ page, query, status }) => {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/v1/task/trashed`,
      {
        headers: getAuthHeaders(),
        params: { page, per_page: trashedTasksPerPage, query, status },
      }
    );
    return response.data.data;
  };

  // React Query: Fetch trashed tasks
  const { data: trashedTasks, refetch } = useQuery({
    queryKey: ["trashedTasks", searchQuery],
    queryFn: () =>
      fetchTrashedTasks({ page: currentPage, query: searchQuery, status }),
    keepPreviousData: true,
    onError: () => toast.error("Error fetching trashed tasks."),
  });

  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setCurrentPage(1);
      fetchTrashedTasks(1, searchQuery);
      setMessage("No search found.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/trashed-search`,
        {
          headers: getAuthHeaders(),
          params: {
            query: searchQuery,
            status: status.toLowerCase(),
            page: currentPage,
          },
        }
      );

      const data = response.data?.data || {};
      const trashedTasks = Array.isArray(data.data) ? data.data : [];

      setTrashedTasks({
        data: trashedTasks,
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
      });

      setMessage(trashedTasks.length === 0 ? "No search found." : "");
    } catch (error) {
      setMessage("Error fetching trashed tasks: Please try again.");
      console.error("Error fetching trashed tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Restore selected tasks
  const restoreSelectedTasks = () => {
    selectedTasks.forEach((taskId) => restoreTaskMutation.mutate(taskId));
    setSelectedTasks([]);
  };

  // Force delete selected tasks
  const forceDeleteSelectedTasks = () => {
    selectedTasks.forEach((taskId) => forceDeleteTaskMutation.mutate(taskId));
    setSelectedTasks([]);
  };

  // Handle individual task checkbox change
  const handleCheckboxChange = (taskId) => {
    setSelectedTasks((prevSelectedTasks) =>
      prevSelectedTasks.includes(taskId)
        ? prevSelectedTasks.filter((id) => id !== taskId)
        : [...prevSelectedTasks, taskId]
    );
  };

  // Handle select all checkbox
  const handleSelectAllChange = async (e) => {
    if (e.target.checked && trashedTasks?.data) {
      const allTaskIds = [];
      for (let i = 1; i <= trashedTasks.last_page; i++) {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/task/trashed`,
          {
            headers: getAuthHeaders(),
            params: {
              page: i,
              per_page: trashedTasksPerPage,
              query: searchQuery,
              status,
            },
          }
        );
        const pageData = response.data?.data?.data || [];
        allTaskIds.push(...pageData.map((task) => task.id));
      }
      setSelectedTasks(allTaskIds);
    } else {
      setSelectedTasks([]);
    }
  };

  // Check if all tasks are selected
  const isAllSelected =
    trashedTasks?.data?.length > 0 &&
    trashedTasks.data.every((task) => selectedTasks.includes(task.id));

  // Handle next page
  const handleNextPage = () => {
    if (trashedTasks?.current_page < trashedTasks?.last_page) {
      setCurrentPage(trashedTasks.current_page + 1);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (trashedTasks?.current_page > 1) {
      setCurrentPage(trashedTasks.current_page - 1);
    }
  };

  // Generate pagination buttons
  const getPaginationButtons = () => {
    const totalPages = trashedTasks?.last_page || 1;
    const currentPage = trashedTasks?.current_page || 1;
    let pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      for (
        let i = Math.max(currentPage - 1, 2);
        i <= Math.min(currentPage + 1, totalPages - 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== "...") {
      setCurrentPage(page);
    }
  };

  // Mutations
  const restoreTaskMutation = useMutation({
    mutationFn: (taskId) =>
      axios.patch(
        `http://localhost:8000/api/v1/tasks/${taskId}/restore`,
        {},
        { headers: getAuthHeaders() }
      ),
    onSuccess: () => {
      toast.success("Task restored successfully!", {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to restore task.");
    },
  });

  const handleRestoreTask = (taskId) => {
    restoreTaskMutation.mutate(taskId);
  };

  const forceDeleteTaskMutation = useMutation({
    mutationFn: (taskId) =>
      axios.delete(
        `http://localhost:8000/api/v1/tasks/${taskId}/force-delete`,
        { headers: getAuthHeaders() }
      ),
    onSuccess: () => {
      toast.success("Task permanently deleted!", {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      refetch();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete task permanently."
      );
    },
  });

  const handleForceDeleteTask = (taskId) => {
    forceDeleteTaskMutation.mutate(taskId);
  };

  // Setting document title
  useEffect(() => {
    document.title = "Archive - Task Management";
  }, []);

  return (
    <>
      <div
        className="relative flex flex-col items-center h-screen w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      >
        <h1 className="font-poppins font-bold text-3xl text-black py-8">
          Archived Tasks
        </h1>

        <div className="flex flex-col items-center gap-5 w-full">
          <div className="bg-blue-500 absolute flex flex-col items-start gap-6 p-8 w-full max-w-5xl rounded-md font-poppins">
            <div className="flex flex-col gap-2 md:gap-0 md:flex-row justify-between w-full">
              <div className="flex items-center gap-x-2">
                {selectedTasks.length > 0 && (
                  <>
                    <button
                      onClick={restoreSelectedTasks}
                      className="bg-green-500 text-white px-4 py-2 rounded-md mr-2"
                      disabled={selectedTasks.length === 0}
                    >
                      Restore Selected
                    </button>
                    <button
                      onClick={forceDeleteSelectedTasks}
                      className="bg-red-500 text-white px-4 py-2 rounded-md mr-4"
                      disabled={selectedTasks.length === 0}
                    >
                      Delete Selected
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="px-4 py-2 rounded-md"
                  type="text"
                  placeholder="Search trashed tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto w-full mt-4 rounded-md">
              <table className="min-w-full table-auto bg-white">
                <thead className="w-full">
                  <tr className="bg-gray-400">
                    <td className="text-center px-4 py-2">
                      <input
                        type="checkbox"
                        onChange={handleSelectAllChange}
                        checked={isAllSelected}
                      />
                      Select All
                    </td>
                    <th className="text-center px-4 py-2">Task Title</th>
                    <th className="text-center px-4 py-2">Task Description</th>
                    <th className="text-center px-4 py-2 ">Status</th>
                    <th className="text-center px-4 py-2 ">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trashedTasks?.data ? (
                    trashedTasks.data.length > 0 ? (
                      trashedTasks.data.map((task) => (
                        <tr key={task.id}>
                          <td className="flex justify-center px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => handleCheckboxChange(task.id)}
                            />
                          </td>
                          <td className="text-center px-4 py-2">{task.name}</td>
                          <td className="text-center px-4 py-2">{task.task}</td>
                          <td className="text-center px-4 py-2">
                            {task.status}
                          </td>
                          <td className="text-center px-4 py-2 flex justify-center gap-4">
                            <div className="flex gap-2">
                              <Button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                onClick={() => handleRestoreTask(task.id)}
                              >
                                Restore
                              </Button>
                              <Button
                                className="bg-red-500 text-white px-4 py-2 rounded-md"
                                onClick={() => handleForceDeleteTask(task.id)}
                              >
                                Delete (Force)
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center text-[#BBBBBB] text-xl px-4 py-2"
                        >
                          {message || "No Tasks Found!"}
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center text-[#BBBBBB] text-xl px-4 py-2"
                      >
                        {message || "No Tasks Found!"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (only shown if trashedTasks data is available) */}
            {trashedTasks?.data?.length > 0 && (
              <div className="w-full flex justify-center gap-4 mt-4">
                <Button
                  onClick={handlePreviousPage}
                  disabled={trashedTasks?.current_page <= 1}
                  className="bg-gray-400 text-white rounded-md"
                >
                  Previous
                </Button>

                {/* Dynamic Pagination Buttons */}
                {getPaginationButtons().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageClick(page)}
                    className={`bg-black text-white rounded-md px-4 py-2 ${
                      page === trashedTasks?.current_page
                        ? "bg-green-500"
                        : "hover:bg-black"
                    } `}
                  >
                    {page}
                  </button>
                ))}

                <Button
                  onClick={handleNextPage}
                  disabled={
                    trashedTasks?.current_page >= trashedTasks?.last_page
                  }
                  className="bg-gray-400 text-white rounded-md"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Archive;
