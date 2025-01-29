import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cards from "../../components/Cards";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import axios from "../../utils/Axios";
import { toast, Bounce } from "react-toastify";

const Tasks = () => {
  // State Variables
  const [formData, setFormData] = useState({ name: "", task: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(3);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [noDataFound, setNoDataFound] = useState(false);
  const [Data, setData] = useState(null);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React Router and Query Client
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Auth Header function
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  // API Request (Fetching Tasks)
  const { data, refetch } = useQuery({
    queryKey: ["tasks", currentPage],
    queryFn: async () => {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/tasks", {
        headers: getAuthHeaders(),
        params: {
          page: currentPage,
          per_page: tasksPerPage,
          query: appliedSearchQuery,
        },
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  // Handle Search
  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setAppliedSearchQuery("");
      setCurrentPage(1);
      setNoDataFound(false);
      refetch();
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/tasks-search`,
        {
          headers: getAuthHeaders(),
          params: {
            query: searchQuery,
            page: 1,
            per_page: tasksPerPage,
          },
        }
      );

      console.log("Search API Response:", response.data);

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setAppliedSearchQuery(searchQuery);
        setCurrentPage(1);
        setData(response.data);
        setNoDataFound(false);
        queryClient.setQueryData(["tasks", 1], response.data);
      } else {
        setAppliedSearchQuery("");
        setCurrentPage(1);
        setNoDataFound(true);
      }
    } catch (error) {
      console.error("Error searching tasks:", error);
      toast.error("An error occurred while searching for tasks.", {
        position: "bottom-right",
        autoClose: 2000,
        theme: "light",
      });
    }
  };

  // Pagination Controls
  const handleNextPage = () => {
    if (data?.meta?.current_page < data?.meta?.last_page) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (data?.meta?.current_page > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const getPaginationButtons = () => {
    const totalPages = data?.meta?.last_page || 1;
    const currentPage = data?.meta?.current_page || 1;
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

  // Form Data Handling
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "radio") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value === "true",
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Mutations for Create or Update Task
  const { mutate: createOrUpdateTask } = useMutation({
    mutationFn: async (taskPayload) => {
      if (currentTask) {
        return await axios.put(
          `http://127.0.0.1:8000/api/v1/tasks/${currentTask.id}`,
          taskPayload,
          {
            headers: getAuthHeaders(),
          }
        );
      } else {
        return await axios.post(
          "http://127.0.0.1:8000/api/v1/tasks",
          taskPayload,
          {
            headers: getAuthHeaders(),
          }
        );
      }
    },
    onSuccess: () => {
      toast.success(
        currentTask ? "Successfully Updated!" : "Successfully Created!",
        {
          position: "bottom-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        }
      );
      queryClient.invalidateQueries(["tasks", currentPage, searchQuery]);
      setFormData({ name: "", task: "" });
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error("Error saving task.", {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.error("Error saving task:", err);
    },
  });

  // Mutations for Deleting Task
  const { mutate: deleteTask } = useMutation({
    mutationFn: async (taskId) => {
      return await axios.delete(
        `http://127.0.0.1:8000/api/v1/tasks/${taskId}`,
        {
          headers: getAuthHeaders(),
        }
      );
    },
    onSuccess: () => {
      toast.success("Task deleted successfully!", {
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
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["tasks", currentPage, searchQuery]);
    },
    onError: (err) => {
      toast.error("Error deleting task.", {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.error("Error deleting task:", err);
    },
  });

  // Modal Handling for Delete
  const openDeleteModal = (taskId) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTaskToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Modal Handling for Create/Update Task
  const openModalForUpdate = (task) => {
    setCurrentTask(task);
    setFormData({ name: task.name, status: task.status, task: task.task });
    setIsModalOpen(true);
  };

  const openModalForCreate = () => {
    setCurrentTask(null);
    setFormData({ name: "", task: "" });
    setIsModalOpen(true);
  };

  // Authentication and Page Navigation Handling
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "Tasks - Task Management";
  }, []);

  return (
    <>
      <h1 className="font-poppins font-bold text-3xl text-black py-8 text-center">Tasks</h1>

      <div className="flex flex-col items-center gap-5 w-full">
        <div className="bg-blue-400 bg-opacity-95 absolute flex flex-col items-start gap-6 p-8 w-full max-w-5xl rounded-md font-poppins">
          {/* Controls for Creating and Searching Tasks */}
          <div className="flex flex-col gap-2 md:gap-0 md:flex-row justify-between w-full">
            <div className="flex items-center gap-x-2">
              <Button
                className="bg-green-500 px-4 py-2 rounded-md"
                onClick={openModalForCreate}
              >
                Create
              </Button>
              <Button className="bg-yellow-500 px-4 py-2 rounded-md">
                <Link to={"archive"}>Archive</Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="px-4 py-2 rounded-md"
                type="text"
                placeholder="Search..."
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

          {/* Display Tasks in Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1280px] mx-auto">
            {noDataFound ? (
              <p className="col-span-full text-center text-2xl text-gray-400">
                No search found.
              </p>
            ) : data && Array.isArray(data.data) && data.data.length > 0 ? (
              data.data.map((task) => (
                <Cards key={task.id} className={"bg-white"}>
                  <h1 className="text-lg font-semibold">
                    Task Title: {task.name}
                  </h1>
                  <h1 className="text-lg font-semibold">
                    Task Description: {task.task}
                  </h1>
                  <h1 className="text-lg font-semibold">
                    Status: {task.status}
                  </h1>

                  <div className="flex gap-3 mt-4 justify-center">
                    <Button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md"
                      onClick={() => openModalForUpdate(task)}
                    >
                      Update
                    </Button>
                    <Button
                      className="bg-red-500 text-white px-4 py-2 rounded-md"
                      onClick={() => openDeleteModal(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Cards>
              ))
            ) : (
              <p className="col-span-full text-center text-2xl text-gray-400">
                No tasks available.
              </p>
            )}
          </div>

          {/* Pagination Controls (only shown if tasks are available) */}
          {data && Array.isArray(data.data) && data.data.length > 0 && (
            <div className="w-full flex justify-center gap-4 mt-4">
              <Button
                onClick={handlePreviousPage}
                disabled={data?.meta?.current_page <= 1}
                className="bg-gray-400 text-white rounded-md"
              >
                Previous
              </Button>

              {/* Dynamic Pagination Buttons */}
              {getPaginationButtons().map((page, index) => (
                <Button
                  key={index}
                  onClick={() => handlePageClick(page)}
                  className={`bg-black text-white rounded-md px-4 py-2 ${
                    page === currentPage ? "bg-green-500" : "hover:bg-black"
                  }`}
                >
                  {page}
                </Button>
              ))}

              <Button
                onClick={handleNextPage}
                disabled={data?.meta?.current_page >= data?.meta?.last_page}
                className="bg-gray-400 text-white rounded-md"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Modal for Creating or Updating Tasks */}
        <Modal
          isOpen={isModalOpen}
          className="bg-blue-400"
          closeModal={() => setIsModalOpen(false)}
        >
          <div className="flex flex-col items-center gap-2 pt-5 w-[360px]">
            <h2 className="text-2xl font-bold text-black">
              {currentTask ? "Update Task" : "Create Task"}
            </h2>
            <form
              className="flex flex-col w-full gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                createOrUpdateTask(formData);
              }}
            >
              <label className="text-black font-bold">Task Title:</label>
              <input
                className="w-full px-4 py-2 border rounded-md mb-3"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <label className="text-black font-bold">Task Description:</label>
              <textarea
                className="w-full px-4 py-2 border rounded-md mb-3"
                name="task"
                value={formData.task}
                onChange={handleInputChange}
                rows="5"
              />

              {currentTask && (
                <div className="flex flex-col gap-2">
                  <span>Status:</span>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="true"
                      checked={formData.status === true}
                      onChange={handleInputChange}
                    />
                    <span className="ml-2">Completed</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="false"
                      checked={formData.status === false}
                      onChange={handleInputChange}
                    />
                    <span className="ml-2">Incomplete</span>
                  </label>
                </div>
              )}

              <div className="flex justify-center gap-4 mt-4">
                <Button
                  type="button"
                  className="bg-gray-400 text-white rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-500 text-white rounded-md"
                >
                  {currentTask ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Modal for Deleting Tasks */}
        <Modal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          className="bg-white"
        >
          <div className="flex flex-col items-center">
            <p className="font-semibold text-xl text-black">
              Are you sure you want to delete this task?
            </p>
            <div className="flex gap-4 mt-5">
              <Button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  deleteTask(taskToDelete);
                  closeDeleteModal();
                }}
              >
                Yes, Delete
              </Button>
              <Button
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
                onClick={closeDeleteModal}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Tasks;
