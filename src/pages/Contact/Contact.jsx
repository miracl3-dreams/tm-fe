import { useEffect, useState } from "react";
import axios from "../../utils/Axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/contact",
        formData
      );
      alert(response.data.message);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("There was an error submitting the form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
      document.title = "Contact - Task Management";
    });

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {isSubmitting && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-20">
            <p className="text-white text-lg font-semibold">Submitting...</p>
          </div>
        )}
        <div
          className="bg-white bg-cover bg-bottom flex justify-center items-center flex-1"
        >
          <div className="bg-blue-400 bg-opacity-95 px-5 py-10 rounded-md shadow-md w-[90%] max-w-[400px] md:max-w-[350px] lg:w-[30%] relative">
            <h2 className="font-poppins font-bold text-xl text-center mb-4">
              Contact Us
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                  rows="5"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-md shadow-md hover:bg-blue-600 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
